"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface BondResultSummaryProps {
  kpis: {
    issuerTCEA: number
    investorTREA: number
    duration: number
    modifiedDuration: number
    convexity: number
    theoreticalPrice: number
    profitLoss: number
  }
  bond: {
    commercialValue: number
    floating: number
    cavali: number
    currency: string
  }
}

export function BondResultSummary({ kpis, bond }: BondResultSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: bond.currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  const formatNumber = (value: number, decimals = 4) => {
    return new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sección para el emisor */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Para el emisor</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-slate-600">TCEA</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Tasa de Costo Efectiva Anual. Calculada como IRR de los flujos del emisor: (1+IRR)^k-1</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold text-lg">{formatPercent(kpis.issuerTCEA)}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-slate-600">Precio teórico mínimo (si vende)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Valor presente de los flujos futuros descontados a la TCEA del emisor.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold">{formatCurrency(kpis.theoreticalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección para el inversionista */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Para el inversionista</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-slate-600">TREA</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Tasa de Rendimiento Efectiva Anual. Calculada como IRR de los flujos del inversionista.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold text-lg">{formatPercent(kpis.investorTREA)}</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-slate-600">Precio de mercado pagado</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Valor comercial más los costos del inversionista (flotación y CAVALI).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold">
                {formatCurrency(bond.commercialValue + (bond.commercialValue * (bond.floating + bond.cavali)) / 100)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de métricas comunes */}
      <Card className="border-slate-200 bg-slate-50 md:col-span-2">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Métricas de riesgo</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-slate-600">Duración (años)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Duración de Macaulay. Promedio ponderado del tiempo hasta cada flujo de caja.</p>
                      <p className="text-xs mt-1">D = Σt·CFt/(1+i)^t / ΣCFt/(1+i)^t</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold text-lg">{formatNumber(kpis.duration, 2)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-slate-600">Duración modificada</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Sensibilidad del precio a cambios en la tasa de interés.</p>
                      <p className="text-xs mt-1">D* = D/(1+i)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold text-lg">{formatNumber(kpis.modifiedDuration, 2)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-slate-600">Convexidad</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Medida de la curvatura en la relación entre el precio y el rendimiento.</p>
                      <p className="text-xs mt-1">C = Σt(t+1)·CFt/(1+i)^(t+2) / ΣCFt/(1+i)^t</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="font-semibold text-lg">{formatNumber(kpis.convexity, 4)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de utilidad/pérdida */}
      <Card
        className={`md:col-span-2 ${kpis.profitLoss >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">Utilidad / Pérdida del inversionista</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>Diferencia entre el precio teórico y el desembolso inicial del inversionista.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className={`font-bold text-xl ${kpis.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(kpis.profitLoss)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
