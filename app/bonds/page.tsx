"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowLeft, CalendarIcon, Info, Plus, X, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Sidebar } from "../components/sidebar"
import { FullPageLoader } from "../components/full-page-loader"


// Define types for form data
interface BondFormData {
  // General Data
  emissionDate: Date | undefined
  currency: string
  exchangeRate: number
  paymentFrequency: string
  customFrequency: number
  totalTerm: number
  initialQuotaPercentage: number
  amortizationMethod: string
  rateType: string
  capitalizationM: number

  // Issuer Data
  nominalValue: number
  initialRate: number
  posteriorRate: number | null
  rateChangeYear: number | null
  redemptionPremium: number
  structuring: number
  placement: number

  // Investor Data
  commercialValue: number
  marketRate: number
  floating: number
  cavali: number
  partialGraceAmortizationPercentage: number
  totalGracePeriods: number[]
  partialGracePeriods: number[]
}

// Define validation errors type
interface ValidationErrors {
  emissionDate?: string
  currency?: string
  exchangeRate?: string
  paymentFrequency?: string
  customFrequency?: string
  totalTerm?: string
  initialQuotaPercentage?: string
  amortizationMethod?: string // Añadimos esta propiedad
  rateType?: string
  capitalizationM?: string
  nominalValue?: string
  initialRate?: string
  posteriorRate?: string
  rateChangeYear?: string
  redemptionPremium?: string
  structuring?: string
  placement?: string
  commercialValue?: string
  marketRate?: string
  floating?: string
  cavali?: string
  partialGraceAmortizationPercentage?: string
  totalGracePeriods?: string
  partialGracePeriods?: string
}

export default function NewBondPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const duplicateId = searchParams.get("duplicate")

  // Initialize form data with default values
  const [formData, setFormData] = useState<BondFormData>({
    emissionDate: new Date(),
    currency: "PEN",
    exchangeRate: 3.7,
    paymentFrequency: "Semestral",
    customFrequency: 6,
    totalTerm: 5,
    initialQuotaPercentage: 0,
    amortizationMethod: "Francés",
    rateType: "TEA",
    capitalizationM: 12,

    nominalValue: 100000,
    initialRate: 8,
    posteriorRate: null,
    rateChangeYear: null,
    redemptionPremium: 0,
    structuring: 1,
    placement: 0.5,

    commercialValue: 100000,
    marketRate: 10,
    floating: 0.5,
    cavali: 0.5,
    partialGraceAmortizationPercentage: 0,
    totalGracePeriods: [],
    partialGracePeriods: [],
  })

  // State for validation errors
  const [errors, setErrors] = useState<ValidationErrors>({})

  // State for derived values
  const [derivedN, setDerivedN] = useState<number>(0)
  const [calculatedNominalValue, setCalculatedNominalValue] = useState<number>(0)
  const [calculatedTES, setCalculatedTES] = useState<number>(0)

  // State for new grace period inputs
  const [newTotalGracePeriod, setNewTotalGracePeriod] = useState<string>("")
  const [newPartialGracePeriod, setNewPartialGracePeriod] = useState<string>("")

  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Calculate derived values when relevant form fields change
  useEffect(() => {
    // Calculate n (number of payments)
    const monthsBetweenPayments =
      formData.paymentFrequency === "Personalizado"
        ? formData.customFrequency
        : getMonthsFromFrequency(formData.paymentFrequency)

    const n = Math.floor((12 / monthsBetweenPayments) * formData.totalTerm)
    setDerivedN(n)

    // Calculate nominal value based on commercial value and initial quota
    const calculatedValue = formData.commercialValue * (1 - formData.initialQuotaPercentage / 100)
    setCalculatedNominalValue(calculatedValue)

    // Update nominal value if it's not manually edited
    if (formData.nominalValue === 0 || formData.nominalValue === formData.commercialValue) {
      setFormData((prev) => ({
        ...prev,
        nominalValue: calculatedValue,
      }))
    }

    // Calculate TES (Effective Rate per Period)
    let tes = 0
    const days = getDaysFromFrequency(formData.paymentFrequency, formData.customFrequency)

    if (formData.rateType === "TEA") {
      tes = Math.pow(1 + formData.initialRate / 100, days / 360) - 1
    } else {
      // TNA
      tes =
        Math.pow(1 + formData.initialRate / 100 / formData.capitalizationM, (days * formData.capitalizationM) / 360) - 1
    }

    setCalculatedTES(tes)
  }, [
    formData.paymentFrequency,
    formData.customFrequency,
    formData.totalTerm,
    formData.commercialValue,
    formData.initialQuotaPercentage,
    formData.rateType,
    formData.initialRate,
    formData.capitalizationM,
    formData.nominalValue,
  ])

  // Helper function to get months between payments based on frequency
  const getMonthsFromFrequency = (frequency: string): number => {
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
      case "Personalizado":
        return formData.customFrequency
      default:
        return 6
    }
  }

  // Helper function to get days based on frequency
  const getDaysFromFrequency = (frequency: string, customFrequency: number): number => {
    const months = frequency === "Personalizado" ? customFrequency : getMonthsFromFrequency(frequency)
    return months * 30 // Simplified: 30 days per month
  }

  // Handle form field changes
  const handleChange = (field: keyof BondFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for the field when it changes
    if (field in errors) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  // Handle adding a total grace period
  const handleAddTotalGracePeriod = () => {
    const period = Number.parseInt(newTotalGracePeriod)
    if (isNaN(period) || period <= 0 || period > derivedN) {
      setErrors((prev) => ({
        ...prev,
        totalGracePeriods: `El período debe ser un número entre 1 y ${derivedN}`,
      }))
      return
    }

    if (formData.totalGracePeriods.includes(period)) {
      setErrors((prev) => ({
        ...prev,
        totalGracePeriods: "Este período ya está en la lista",
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      totalGracePeriods: [...prev.totalGracePeriods, period].sort((a, b) => a - b),
    }))

    setNewTotalGracePeriod("")
    setErrors((prev) => ({
      ...prev,
      totalGracePeriods: undefined,
    }))
  }

  // Handle removing a total grace period
  const handleRemoveTotalGracePeriod = (period: number) => {
    setFormData((prev) => ({
      ...prev,
      totalGracePeriods: prev.totalGracePeriods.filter((p) => p !== period),
    }))
  }

  // Handle adding a partial grace period
  const handleAddPartialGracePeriod = () => {
    const period = Number.parseInt(newPartialGracePeriod)
    if (isNaN(period) || period <= 0 || period > derivedN) {
      setErrors((prev) => ({
        ...prev,
        partialGracePeriods: `El período debe ser un número entre 1 y ${derivedN}`,
      }))
      return
    }

    if (formData.partialGracePeriods.includes(period)) {
      setErrors((prev) => ({
        ...prev,
        partialGracePeriods: "Este período ya está en la lista",
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      partialGracePeriods: [...prev.partialGracePeriods, period].sort((a, b) => a - b),
    }))

    setNewPartialGracePeriod("")
    setErrors((prev) => ({
      ...prev,
      partialGracePeriods: undefined,
    }))
  }

  // Handle removing a partial grace period
  const handleRemovePartialGracePeriod = (period: number) => {
    setFormData((prev) => ({
      ...prev,
      partialGracePeriods: prev.partialGracePeriods.filter((p) => p !== period),
    }))
  }

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    // General Data validation
    if (!formData.emissionDate) {
      newErrors.emissionDate = "La fecha de emisión es requerida"
    }

    if (!formData.currency) {
      newErrors.currency = "La moneda es requerida"
    }

    if (formData.currency !== "PEN" && formData.exchangeRate <= 0) {
      newErrors.exchangeRate = "El tipo de cambio debe ser mayor a 0"
    }

    if (!formData.paymentFrequency) {
      newErrors.paymentFrequency = "La frecuencia de pago es requerida"
    }

    if (
      formData.paymentFrequency === "Personalizado" &&
      (formData.customFrequency < 1 || formData.customFrequency > 12)
    ) {
      newErrors.customFrequency = "Los meses entre pagos deben estar entre 1 y 12"
    }

    if (formData.totalTerm < 1 || formData.totalTerm > 40) {
      newErrors.totalTerm = "El plazo total debe estar entre 1 y 40 años"
    }

    if (formData.initialQuotaPercentage < 0 || formData.initialQuotaPercentage > 100) {
      newErrors.initialQuotaPercentage = "El porcentaje de cuota inicial debe estar entre 0 y 100"
    }

    if (!formData.rateType) {
      newErrors.rateType = "El tipo de tasa es requerido"
    }

    if (formData.rateType === "TNA" && ![1, 2, 3, 4, 6, 12].includes(formData.capitalizationM)) {
      newErrors.capitalizationM = "La capitalización debe ser 1, 2, 3, 4, 6 o 12"
    }

    // Issuer Data validation
    if (formData.nominalValue <= 0) {
      newErrors.nominalValue = "El valor nominal debe ser mayor a 0"
    }

    if (formData.initialRate < 0 || formData.initialRate > 100) {
      newErrors.initialRate = "La tasa inicial debe estar entre 0 y 100"
    }

    if (formData.posteriorRate !== null && (formData.posteriorRate < 0 || formData.posteriorRate > 100)) {
      newErrors.posteriorRate = "La tasa posterior debe estar entre 0 y 100"
    }

    if (
      formData.posteriorRate !== null &&
      formData.rateChangeYear !== null &&
      (formData.rateChangeYear <= 0 || formData.rateChangeYear > formData.totalTerm)
    ) {
      newErrors.rateChangeYear = "El año de cambio debe ser mayor a 0 y menor o igual al plazo total"
    }

    if (formData.redemptionPremium < 0 || formData.redemptionPremium > 10) {
      newErrors.redemptionPremium = "La prima a la redención debe estar entre 0 y 10"
    }

    if (formData.structuring < 0 || formData.structuring > 5) {
      newErrors.structuring = "La estructuración debe estar entre 0 y 5"
    }

    if (formData.placement < 0 || formData.placement > 2) {
      newErrors.placement = "La colocación debe estar entre 0 y 2"
    }

    // Investor Data validation
    if (formData.commercialValue <= 0) {
      newErrors.commercialValue = "El valor comercial debe ser mayor a 0"
    }

    if (formData.marketRate < 0 || formData.marketRate > 100) {
      newErrors.marketRate = "La TEA de mercado debe estar entre 0 y 100"
    }

    if (formData.floating < 0 || formData.floating > 2) {
      newErrors.floating = "La flotación debe estar entre 0 y 2"
    }

    if (formData.cavali < 0 || formData.cavali > 2) {
      newErrors.cavali = "CAVALI debe estar entre 0 y 2"
    }

    if (formData.partialGraceAmortizationPercentage < 0 || formData.partialGraceAmortizationPercentage > 100) {
      newErrors.partialGraceAmortizationPercentage = "El porcentaje de amortización debe estar entre 0 y 100"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate saving and calculating
    setTimeout(() => {
      // In a real app, you would send the data to your backend
      // and then redirect to the bond detail page

      // Generate a random ID for the new bond
      const newBondId = Math.floor(Math.random() * 1000).toString()

      toast({
        title: "Bono creado",
        description: "El bono ha sido creado y calculado correctamente",
      })

      setIsLoading(false)
      router.push(`/bonds/${newBondId}`)
    }, 1500)
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar currentPath="/bonds" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-8 pt-20">
          <Toaster />

          {/* Back button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <h1 className="text-2xl font-bold text-slate-800 mb-6">Crear nuevo bono</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Data Section */}
            <Card>
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <CardTitle className="text-lg">Datos generales</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Emission Date */}
                  <div className="space-y-2">
                    <Label htmlFor="emissionDate">Fecha de emisión</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.emissionDate && "text-muted-foreground",
                            errors.emissionDate && "border-red-500",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.emissionDate ? (
                            format(formData.emissionDate, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.emissionDate}
                          onSelect={(date) => handleChange("emissionDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.emissionDate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.emissionDate}
                      </p>
                    )}
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleChange("currency", value)}>
                      <SelectTrigger className={cn(errors.currency && "border-red-500")}>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PEN">PEN - Soles</SelectItem>
                        <SelectItem value="USD">USD - Dólares</SelectItem>
                        <SelectItem value="EUR">EUR - Euros</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.currency}
                      </p>
                    )}
                  </div>

                  {/* Exchange Rate - Only visible if currency is not PEN */}
                  {formData.currency !== "PEN" && (
                    <div className="space-y-2">
                      <Label htmlFor="exchangeRate">Tipo de cambio</Label>
                      <Input
                        id="exchangeRate"
                        type="number"
                        step="0.01"
                        value={formData.exchangeRate}
                        onChange={(e) => handleChange("exchangeRate", Number.parseFloat(e.target.value))}
                        className={cn(errors.exchangeRate && "border-red-500")}
                      />
                      {errors.exchangeRate && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.exchangeRate}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Frequency */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentFrequency">Frecuencia de pago</Label>
                    <Select
                      value={formData.paymentFrequency}
                      onValueChange={(value) => handleChange("paymentFrequency", value)}
                    >
                      <SelectTrigger className={cn(errors.paymentFrequency && "border-red-500")}>
                        <SelectValue placeholder="Seleccionar frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mensual">Mensual</SelectItem>
                        <SelectItem value="Trimestral">Trimestral</SelectItem>
                        <SelectItem value="Cuatrimestral">Cuatrimestral (4 meses)</SelectItem>
                        <SelectItem value="Semestral">Semestral</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                        <SelectItem value="Personalizado">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentFrequency && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.paymentFrequency}
                      </p>
                    )}
                  </div>

                  {/* Custom Frequency - Only visible if payment frequency is "Personalizado" */}
                  {formData.paymentFrequency === "Personalizado" && (
                    <div className="space-y-2">
                      <Label htmlFor="customFrequency">Meses entre pagos (1-12)</Label>
                      <Input
                        id="customFrequency"
                        type="number"
                        min="1"
                        max="12"
                        value={formData.customFrequency}
                        onChange={(e) => handleChange("customFrequency", Number.parseInt(e.target.value))}
                        className={cn(errors.customFrequency && "border-red-500")}
                      />
                      {errors.customFrequency && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.customFrequency}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total Term */}
                  <div className="space-y-2">
                    <Label htmlFor="totalTerm">Plazo total (años)</Label>
                    <Input
                      id="totalTerm"
                      type="number"
                      min="1"
                      max="40"
                      value={formData.totalTerm}
                      onChange={(e) => handleChange("totalTerm", Number.parseInt(e.target.value))}
                      className={cn(errors.totalTerm && "border-red-500")}
                    />
                    {errors.totalTerm && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.totalTerm}
                      </p>
                    )}
                  </div>

                  {/* Initial Quota Percentage */}
                  <div className="space-y-2">
                    <Label htmlFor="initialQuotaPercentage">% Cuota inicial</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="initialQuotaPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.initialQuotaPercentage}
                        onChange={(e) => handleChange("initialQuotaPercentage", Number.parseFloat(e.target.value))}
                        className={cn(errors.initialQuotaPercentage && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.initialQuotaPercentage && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.initialQuotaPercentage}
                      </p>
                    )}
                  </div>

                  {/* Amortization Method - Fixed to "Francés" */}
                  <div className="space-y-2">
                    <Label htmlFor="amortizationMethod">Método de amortización</Label>
                    <Input id="amortizationMethod" value="Francés" disabled className="bg-slate-50" />
                  </div>

                  {/* Rate Type */}
                  <div className="space-y-2">
                    <Label>Tipo de tasa</Label>
                    <RadioGroup
                      value={formData.rateType}
                      onValueChange={(value) => handleChange("rateType", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="TEA" id="tea" />
                        <Label htmlFor="tea" className="cursor-pointer">
                          TEA
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="TNA" id="tna" />
                        <Label htmlFor="tna" className="cursor-pointer">
                          TNA
                        </Label>
                      </div>
                    </RadioGroup>
                    {errors.rateType && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.rateType}
                      </p>
                    )}
                  </div>

                  {/* Capitalization M - Only visible if rate type is TNA */}
                  {formData.rateType === "TNA" && (
                    <div className="space-y-2">
                      <Label htmlFor="capitalizationM">Capitalización m</Label>
                      <Select
                        value={formData.capitalizationM.toString()}
                        onValueChange={(value) => handleChange("capitalizationM", Number.parseInt(value))}
                      >
                        <SelectTrigger className={cn(errors.capitalizationM && "border-red-500")}>
                          <SelectValue placeholder="Seleccionar capitalización" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.capitalizationM && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.capitalizationM}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Derived n - Read-only */}
                  <div className="space-y-2">
                    <Label htmlFor="derivedN">Dato derivado n</Label>
                    <Input id="derivedN" value={derivedN} disabled className="bg-slate-50" />
                    <p className="text-xs text-slate-500">n = (12/meses) × plazo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issuer Data Section */}
            <Card>
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <CardTitle className="text-lg">Datos del emisor</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Nominal Value */}
                  <div className="space-y-2">
                    <Label htmlFor="nominalValue">Valor nominal (C)</Label>
                    <Input
                      id="nominalValue"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.nominalValue}
                      onChange={(e) => handleChange("nominalValue", Number.parseFloat(e.target.value))}
                      className={cn(errors.nominalValue && "border-red-500")}
                    />
                    <p className="text-xs text-slate-500">
                      Calculado: {calculatedNominalValue.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
                    </p>
                    {errors.nominalValue && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.nominalValue}
                      </p>
                    )}
                  </div>

                  {/* Initial Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="initialRate">{formData.rateType} inicial (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="initialRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.initialRate}
                        onChange={(e) => handleChange("initialRate", Number.parseFloat(e.target.value))}
                        className={cn(errors.initialRate && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.initialRate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.initialRate}
                      </p>
                    )}
                  </div>

                  {/* Posterior Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="posteriorRate">{formData.rateType} posterior (%)</Label>
                      <Switch
                        checked={formData.posteriorRate !== null}
                        onCheckedChange={(checked) =>
                          handleChange("posteriorRate", checked ? formData.initialRate : null)
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="posteriorRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.posteriorRate !== null ? formData.posteriorRate : ""}
                        onChange={(e) => handleChange("posteriorRate", Number.parseFloat(e.target.value))}
                        disabled={formData.posteriorRate === null}
                        className={cn(errors.posteriorRate && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.posteriorRate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.posteriorRate}
                      </p>
                    )}
                  </div>

                  {/* Rate Change Year - Only visible if posterior rate is set */}
                  {formData.posteriorRate !== null && (
                    <div className="space-y-2">
                      <Label htmlFor="rateChangeYear">Año de cambio de tasa</Label>
                      <Input
                        id="rateChangeYear"
                        type="number"
                        min="1"
                        max={formData.totalTerm}
                        value={formData.rateChangeYear !== null ? formData.rateChangeYear : ""}
                        onChange={(e) => handleChange("rateChangeYear", Number.parseInt(e.target.value))}
                        className={cn(errors.rateChangeYear && "border-red-500")}
                      />
                      {errors.rateChangeYear && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.rateChangeYear}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Redemption Premium */}
                  <div className="space-y-2">
                    <Label htmlFor="redemptionPremium">Prima a la redención (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="redemptionPremium"
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value={formData.redemptionPremium}
                        onChange={(e) => handleChange("redemptionPremium", Number.parseFloat(e.target.value))}
                        className={cn(errors.redemptionPremium && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.redemptionPremium && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.redemptionPremium}
                      </p>
                    )}
                  </div>

                  {/* Structuring */}
                  <div className="space-y-2">
                    <Label htmlFor="structuring">Estructuración (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="structuring"
                        type="number"
                        min="0"
                        max="5"
                        step="0.01"
                        value={formData.structuring}
                        onChange={(e) => handleChange("structuring", Number.parseFloat(e.target.value))}
                        className={cn(errors.structuring && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.structuring && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.structuring}
                      </p>
                    )}
                  </div>

                  {/* Placement */}
                  <div className="space-y-2">
                    <Label htmlFor="placement">Colocación (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="placement"
                        type="number"
                        min="0"
                        max="2"
                        step="0.01"
                        value={formData.placement}
                        onChange={(e) => handleChange("placement", Number.parseFloat(e.target.value))}
                        className={cn(errors.placement && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.placement && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.placement}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor Data Section */}
            <Card>
              <CardHeader className="bg-slate-50 rounded-t-lg">
                <CardTitle className="text-lg">Datos del inversionista</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Commercial Value */}
                  <div className="space-y-2">
                    <Label htmlFor="commercialValue">Valor comercial</Label>
                    <Input
                      id="commercialValue"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.commercialValue}
                      onChange={(e) => handleChange("commercialValue", Number.parseFloat(e.target.value))}
                      className={cn(errors.commercialValue && "border-red-500")}
                    />
                    {errors.commercialValue && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.commercialValue}
                      </p>
                    )}
                  </div>

                  {/* Market Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="marketRate">TEA mercado (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="marketRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.marketRate}
                        onChange={(e) => handleChange("marketRate", Number.parseFloat(e.target.value))}
                        className={cn(errors.marketRate && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.marketRate && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.marketRate}
                      </p>
                    )}
                  </div>

                  {/* Floating */}
                  <div className="space-y-2">
                    <Label htmlFor="floating">Flotación (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="floating"
                        type="number"
                        min="0"
                        max="2"
                        step="0.01"
                        value={formData.floating}
                        onChange={(e) => handleChange("floating", Number.parseFloat(e.target.value))}
                        className={cn(errors.floating && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.floating && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.floating}
                      </p>
                    )}
                  </div>

                  {/* CAVALI */}
                  <div className="space-y-2">
                    <Label htmlFor="cavali">CAVALI (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="cavali"
                        type="number"
                        min="0"
                        max="2"
                        step="0.01"
                        value={formData.cavali}
                        onChange={(e) => handleChange("cavali", Number.parseFloat(e.target.value))}
                        className={cn(errors.cavali && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.cavali && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.cavali}
                      </p>
                    )}
                  </div>

                  {/* Partial Grace Amortization Percentage */}
                  <div className="space-y-2">
                    <Label htmlFor="partialGraceAmortizationPercentage">% Amortización en gracia parcial</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="partialGraceAmortizationPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.partialGraceAmortizationPercentage}
                        onChange={(e) =>
                          handleChange("partialGraceAmortizationPercentage", Number.parseFloat(e.target.value))
                        }
                        className={cn(errors.partialGraceAmortizationPercentage && "border-red-500")}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                    {errors.partialGraceAmortizationPercentage && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.partialGraceAmortizationPercentage}
                      </p>
                    )}
                  </div>

                  {/* Total Grace Periods */}
                  <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="totalGracePeriods">Periodos de gracia Total</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="totalGracePeriods"
                        type="number"
                        min="1"
                        max={derivedN}
                        placeholder={`Ingrese un número entre 1 y ${derivedN}`}
                        value={newTotalGracePeriod}
                        onChange={(e) => setNewTotalGracePeriod(e.target.value)}
                        className={cn(errors.totalGracePeriods && "border-red-500")}
                      />
                      <Button type="button" onClick={handleAddTotalGracePeriod} variant="outline">
                        <Plus size={16} />
                        Agregar
                      </Button>
                    </div>
                    {errors.totalGracePeriods && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.totalGracePeriods}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.totalGracePeriods.map((period) => (
                        <Badge key={`total-${period}`} variant="secondary" className="flex items-center gap-1">
                          {period}
                          <button
                            type="button"
                            onClick={() => handleRemoveTotalGracePeriod(period)}
                            className="text-slate-500 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Partial Grace Periods */}
                  <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="partialGracePeriods">Periodos de gracia Parcial</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="partialGracePeriods"
                        type="number"
                        min="1"
                        max={derivedN}
                        placeholder={`Ingrese un número entre 1 y ${derivedN}`}
                        value={newPartialGracePeriod}
                        onChange={(e) => setNewPartialGracePeriod(e.target.value)}
                        className={cn(errors.partialGracePeriods && "border-red-500")}
                      />
                      <Button type="button" onClick={handleAddPartialGracePeriod} variant="outline">
                        <Plus size={16} />
                        Agregar
                      </Button>
                    </div>
                    {errors.partialGracePeriods && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.partialGracePeriods}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.partialGracePeriods.map((period) => (
                        <Badge key={`partial-${period}`} variant="secondary" className="flex items-center gap-1">
                          {period}
                          <button
                            type="button"
                            onClick={() => handleRemovePartialGracePeriod(period)}
                            className="text-slate-500 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Grace Period Note */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-slate-50 p-4 rounded-md">
                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <Info size={16} className="mt-0.5 flex-shrink-0" />
                      Si un periodo figura en ambas listas, prevalece Gracia Total; la amortización parcial aplicará el
                      % definido arriba.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Buttons */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-500 hover:bg-green-600">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  "Guardar y calcular"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {isLoading && <FullPageLoader />}
    </div>
  )
}
