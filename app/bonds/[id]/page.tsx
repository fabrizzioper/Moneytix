"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Edit, Trash2, Download, Info, ArrowUp } from "lucide-react"
import { Sidebar } from "../../components/sidebar"
import { BondResultTable } from "../../components/bond-result-table"
import { BondResultTimeline } from "../../components/bond-result-timeline"
import { BondResultChart } from "../../components/bond-result-chart"
import { BondResultSummary } from "../../components/bond-result-summary"
import { FullPageLoader } from "../../components/full-page-loader"

// Datos de ejemplo para un bono
const sampleBond = {
  id: "1",
  code: "BON-001",
  emissionDate: new Date(2025, 4, 5),
  currency: "USD",
  nominalValue: 100000,
  commercialValue: 100000,
  term: 5,
  paymentFrequency: "Semestral",
  initialRate: 8,
  posteriorRate: null,
  rateChangeYear: null,
  redemptionPremium: 1,
  structuring: 1,
  placement: 0.5,
  marketRate: 10,
  floating: 0.5,
  cavali: 0.5,
  partialGraceAmortizationPercentage: 50,
  totalGracePeriods: [1, 2],
  partialGracePeriods: [3, 4],
}

// Tipo para los datos de flujo de caja
interface CashFlowData {
  period: number
  date: Date
  initialBalance: number
  interest: number
  payment: number
  amortization: number
  finalBalance: number
  premium: number
  issuerFlow: number
  investorFlow: number
  isGracePeriod: "none" | "total" | "partial"
}

export default function BondDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bondId = params.id as string

  // Estado para la vista activa
  const [activeView, setActiveView] = useState<"table" | "timeline" | "chart">("table")

  // Estado para el diálogo de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Estado para mostrar/ocultar periodos de gracia total en el gráfico
  const [hideGracePeriods, setHideGracePeriods] = useState(false)

  // Estado para los datos del bono
  const [bond, setBond] = useState(sampleBond)

  // Estado para los datos de flujo de caja calculados
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([])

  // Estado para los KPIs calculados
  const [kpis, setKpis] = useState({
    issuerTCEA: 0,
    investorTREA: 0,
    duration: 0,
    modifiedDuration: 0,
    convexity: 0,
    theoreticalPrice: 0,
    profitLoss: 0,
  })

  // Estado para controlar la carga de cálculos
  const [isCalculating, setIsCalculating] = useState(false)

  // Redirigir inmediatamente si el ID es "new" o "create"
  useEffect(() => {
    if (bondId === "new" || bondId === "create") {
      router.replace("/bonds/form/new")
    }
  }, [bondId, router])

  // Calcular los datos de flujo de caja cuando cambia el bono
  useEffect(() => {
    if (bondId === "new" || bondId === "create") return

    // Calcular los datos de flujo de caja
    const calculatedData = calculateCashFlow(bond)
    setCashFlowData(calculatedData)

    // Calcular los KPIs
    const calculatedKpis = calculateKPIs(calculatedData, bond)
    setKpis(calculatedKpis)
  }, [bond, bondId])

  // Función para calcular el flujo de caja
  const calculateCashFlow = (bond: typeof sampleBond): CashFlowData[] => {
    // Mostrar loader durante los cálculos
    setIsCalculating(true)

    const result: CashFlowData[] = []

    // Determinar el número de periodos basado en la frecuencia y el plazo
    const periodsPerYear = getPeriodsPerYear(bond.paymentFrequency)
    const totalPeriods = periodsPerYear * bond.term

    // Calcular la TES (Tasa Efectiva por Periodo)
    const annualRate = bond.initialRate / 100
    const tes = Math.pow(1 + annualRate, 1 / periodsPerYear) - 1

    // Calcular la cuota usando la fórmula francesa
    const payment = calculateFrenchPayment(bond.nominalValue, tes, totalPeriods)

    // Inicializar el saldo inicial
    let balance = bond.nominalValue

    // Agregar el periodo 0 (desembolso inicial)
    result.push({
      period: 0,
      date: bond.emissionDate,
      initialBalance: 0,
      interest: 0,
      payment: 0,
      amortization: 0,
      finalBalance: balance,
      premium: 0,
      issuerFlow: bond.commercialValue - (bond.commercialValue * (bond.structuring + bond.placement)) / 100,
      investorFlow: -bond.commercialValue - (bond.commercialValue * (bond.floating + bond.cavali)) / 100,
      isGracePeriod: "none",
    })

    // Calcular cada periodo
    for (let i = 1; i <= totalPeriods; i++) {
      // Determinar si es un periodo de gracia
      const isGracePeriod = determineGracePeriod(i, bond.totalGracePeriods, bond.partialGracePeriods)

      // Calcular la fecha del periodo
      const date = calculatePeriodDate(bond.emissionDate, i, bond.paymentFrequency)

      // Calcular el interés
      const interest = balance * tes

      // Determinar la amortización basada en el tipo de periodo de gracia
      let amortization = 0
      if (isGracePeriod === "none") {
        amortization = payment - interest
      } else if (isGracePeriod === "partial") {
        amortization = (payment - interest) * (bond.partialGraceAmortizationPercentage / 100)
      }

      // Calcular el saldo final
      const finalBalance = balance - amortization

      // Calcular la prima (solo en el último periodo)
      const premium = i === totalPeriods ? (bond.nominalValue * bond.redemptionPremium) / 100 : 0

      // Calcular los flujos
      const actualPayment = isGracePeriod === "total" ? interest : payment
      const issuerFlow = -(actualPayment + premium)
      const investorFlow = actualPayment + premium

      // Agregar el periodo al resultado
      result.push({
        period: i,
        date,
        initialBalance: balance,
        interest,
        payment: actualPayment,
        amortization,
        finalBalance,
        premium,
        issuerFlow,
        investorFlow,
        isGracePeriod,
      })

      // Actualizar el saldo para el siguiente periodo
      balance = finalBalance
    }

    // Ocultar loader cuando terminan los cálculos
    setIsCalculating(false)

    return result
  }

  // Función para calcular los KPIs
  const calculateKPIs = (data: CashFlowData[], bond: typeof sampleBond) => {
    // Extraer los flujos para el emisor e inversionista
    const issuerFlows = data.map((d) => d.issuerFlow)
    const investorFlows = data.map((d) => d.investorFlow)

    // Calcular la TCEA del emisor (TIR de los flujos del emisor)
    const issuerTCEA = calculateIRR(issuerFlows)

    // Calcular la TREA del inversionista (TIR de los flujos del inversionista)
    const investorTREA = calculateIRR(investorFlows)

    // Calcular la duración de Macaulay
    const duration = calculateDuration(data, bond)

    // Calcular la duración modificada
    const tes = Math.pow(1 + bond.initialRate / 100, 1 / getPeriodsPerYear(bond.paymentFrequency)) - 1
    const modifiedDuration = duration / (1 + tes)

    // Calcular la convexidad
    const convexity = calculateConvexity(data, bond)

    // Calcular el precio teórico
    const theoreticalPrice = calculateTheoreticalPrice(data, bond)

    // Calcular la utilidad/pérdida del inversionista
    const initialInvestment = bond.commercialValue + (bond.commercialValue * (bond.floating + bond.cavali)) / 100
    const profitLoss = theoreticalPrice - initialInvestment

    return {
      issuerTCEA: issuerTCEA * 100, // Convertir a porcentaje
      investorTREA: investorTREA * 100, // Convertir a porcentaje
      duration,
      modifiedDuration,
      convexity,
      theoreticalPrice,
      profitLoss,
    }
  }

  // Función auxiliar para determinar el tipo de periodo de gracia
  const determineGracePeriod = (period: number, totalGracePeriods: number[], partialGracePeriods: number[]) => {
    if (totalGracePeriods.includes(period)) return "total"
    if (partialGracePeriods.includes(period)) return "partial"
    return "none"
  }

  // Función auxiliar para calcular la fecha de un periodo
  const calculatePeriodDate = (emissionDate: Date, period: number, frequency: string) => {
    const date = new Date(emissionDate)
    const monthsToAdd = period * getMonthsPerPeriod(frequency)
    date.setMonth(date.getMonth() + monthsToAdd)
    return date
  }

  // Función auxiliar para obtener los meses por periodo según la frecuencia
  const getMonthsPerPeriod = (frequency: string) => {
    switch (frequency) {
      case "Mensual":
        return 1
      case "Trimestral":
        return 3
      case "Cuatrimestral":
        return 4
      case "Semestral":
        return 6
      case "Anual":
        return 12
      default:
        return 6 // Por defecto semestral
    }
  }

  // Función auxiliar para obtener los periodos por año según la frecuencia
  const getPeriodsPerYear = (frequency: string) => {
    switch (frequency) {
      case "Mensual":
        return 12
      case "Trimestral":
        return 4
      case "Cuatrimestral":
        return 3
      case "Semestral":
        return 2
      case "Anual":
        return 1
      default:
        return 2 // Por defecto semestral
    }
  }

  // Función para calcular la cuota francesa
  const calculateFrenchPayment = (principal: number, rate: number, periods: number) => {
    return (principal * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1)
  }

  // Función para calcular la TIR (Tasa Interna de Retorno)
  const calculateIRR = (cashFlows: number[]) => {
    // Implementación simplificada de la TIR
    // En una aplicación real, se usaría un algoritmo más robusto
    let guess = 0.1 // Suposición inicial
    const tolerance = 0.0000001
    const maxIterations = 100

    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(cashFlows, guess)
      if (Math.abs(npv) < tolerance) {
        return guess
      }

      const derivative = calculateNPVDerivative(cashFlows, guess)
      const newGuess = guess - npv / derivative

      if (Math.abs(newGuess - guess) < tolerance) {
        return newGuess
      }

      guess = newGuess
    }

    return guess
  }

  // Función auxiliar para calcular el VPN (Valor Presente Neto)
  const calculateNPV = (cashFlows: number[], rate: number) => {
    return cashFlows.reduce((npv, cf, i) => npv + cf / Math.pow(1 + rate, i), 0)
  }

  // Función auxiliar para calcular la derivada del VPN
  const calculateNPVDerivative = (cashFlows: number[], rate: number) => {
    return cashFlows.reduce((derivative, cf, i) => {
      return derivative - (i * cf) / Math.pow(1 + rate, i + 1)
    }, 0)
  }

  // Función para calcular la duración de Macaulay
  const calculateDuration = (data: CashFlowData[], bond: typeof sampleBond) => {
    const tes = Math.pow(1 + bond.initialRate / 100, 1 / getPeriodsPerYear(bond.paymentFrequency)) - 1

    let weightedSum = 0
    let presentValueSum = 0

    data.forEach((d, i) => {
      if (i === 0) return // Saltar el periodo 0

      const presentValue = d.investorFlow / Math.pow(1 + tes, i)
      weightedSum += i * presentValue
      presentValueSum += presentValue
    })

    return weightedSum / presentValueSum / getPeriodsPerYear(bond.paymentFrequency) // Convertir a años
  }

  // Función para calcular la convexidad
  const calculateConvexity = (data: CashFlowData[], bond: typeof sampleBond) => {
    const tes = Math.pow(1 + bond.initialRate / 100, 1 / getPeriodsPerYear(bond.paymentFrequency)) - 1

    let weightedSum = 0
    let presentValueSum = 0

    data.forEach((d, i) => {
      if (i === 0) return // Saltar el periodo 0

      const presentValue = d.investorFlow / Math.pow(1 + tes, i)
      weightedSum += (i * (i + 1) * presentValue) / Math.pow(1 + tes, 2)
      presentValueSum += presentValue
    })

    return weightedSum / presentValueSum / Math.pow(getPeriodsPerYear(bond.paymentFrequency), 2) // Convertir a años²
  }

  // Función para calcular el precio teórico
  const calculateTheoreticalPrice = (data: CashFlowData[], bond: typeof sampleBond) => {
    const marketRate = bond.marketRate / 100
    const periodsPerYear = getPeriodsPerYear(bond.paymentFrequency)
    const marketRatePerPeriod = Math.pow(1 + marketRate, 1 / periodsPerYear) - 1

    return data.reduce((sum, d, i) => {
      if (i === 0) return sum // Saltar el periodo 0
      return sum + d.investorFlow / Math.pow(1 + marketRatePerPeriod, i)
    }, 0)
  }

  // Función para manejar la eliminación del bono
  const handleDelete = () => {
    setDeleteDialogOpen(false)
    // Aquí iría la lógica para eliminar el bono
    router.push("/bonds")
  }

  // Función para exportar los datos a CSV
  const exportToCSV = () => {
    // Crear el contenido del CSV
    let csvContent = "data:text/csv;charset=utf-8,"

    // Encabezados
    csvContent +=
      "Periodo,Fecha,Saldo Inicial,Interés,Cuota,Amortización,Saldo Final,Prima,Flujo Emisor,Flujo Inversionista\n"

    // Datos
    cashFlowData.forEach((d) => {
      csvContent += `${d.period},${d.date.toLocaleDateString()},${d.initialBalance.toFixed(2)},${d.interest.toFixed(2)},${d.payment.toFixed(2)},${d.amortization.toFixed(2)},${d.finalBalance.toFixed(2)},${d.premium.toFixed(2)},${d.issuerFlow.toFixed(2)},${d.investorFlow.toFixed(2)}\n`
    })

    // Crear un enlace para descargar
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `bono_${bond.code}_flujos.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // No renderizar nada durante la redirección
  if (bondId === "new" || bondId === "create") {
    return null
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar currentPath="/bonds" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-8 pt-20">
          {/* Barra superior */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.push("/bonds")} className="mr-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al listado
              </Button>
              <h1 className="text-2xl font-bold text-slate-800">Resultado {bond.code}</h1>
            </div>

            <div className="flex mt-4 md:mt-0 space-x-2">
              <Button variant="outline" onClick={() => router.push(`/bonds/form/new?edit=${bondId}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>

              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar eliminación</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que deseas eliminar el bono {bond.code}? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Selector de vista */}
          <div className="mb-6">
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="table">Tabla</TabsTrigger>
                <TabsTrigger value="timeline">Línea de tiempo</TabsTrigger>
                <TabsTrigger value="chart">Gráfico</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Panel dinámico */}
          <div className="mb-8">
            {activeView === "table" && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Plan de pagos</h2>
                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar CSV
                    </Button>
                  </div>
                  <BondResultTable data={cashFlowData} />
                </CardContent>
              </Card>
            )}

            {activeView === "timeline" && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Línea de tiempo</h2>
                    <Button variant="outline" size="sm" onClick={() => window.scrollTo(0, 0)}>
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Ir al inicio
                    </Button>
                  </div>
                  <BondResultTimeline data={cashFlowData} />
                </CardContent>
              </Card>
            )}

            {activeView === "chart" && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Gráfico de flujos</h2>
                    <div className="flex items-center space-x-2">
                      <Switch id="hide-grace" checked={hideGracePeriods} onCheckedChange={setHideGracePeriods} />
                      <Label htmlFor="hide-grace">Ocultar gracia total</Label>
                    </div>
                  </div>
                  <BondResultChart data={cashFlowData} hideGracePeriods={hideGracePeriods} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen KPI */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold">Resumen de indicadores</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        Estos indicadores están calculados según la normativa SBS 8181-2012 y son útiles para la toma de
                        decisiones financieras.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <BondResultSummary kpis={kpis} bond={bond} />
            </CardContent>
          </Card>
        </div>
        {isCalculating && <FullPageLoader message="Procesando datos del bono..." />}
      </div>
    </div>
  )
}
