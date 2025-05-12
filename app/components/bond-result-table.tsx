"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar, DollarSign, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react"

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

interface BondResultTableProps {
  data: CashFlowData[]
}

// Definir los breakpoints para los diferentes modos de visualización
const MOBILE_BREAKPOINT = 640 // Móvil hasta 640px
const TABLET_BREAKPOINT = 1024 // Tablet hasta 1024px

export function BondResultTable({ data }: BondResultTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"cards" | "scroll" | "table">("table")
  const rowsPerPage = viewMode === "cards" ? 5 : 10
  const totalPages = Math.ceil(data.length / rowsPerPage)

  // Detectar el tamaño de pantalla y establecer el modo de visualización
  useEffect(() => {
    const updateViewMode = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        // Móvil: tarjetas
        setViewMode("cards")
      } else if (width < TABLET_BREAKPOINT) {
        // Tablet: tarjetas
        setViewMode("cards")
      } else {
        // Desktop: tabla completa
        setViewMode("table")
      }
    }

    updateViewMode()
    window.addEventListener("resize", updateViewMode)
    return () => window.removeEventListener("resize", updateViewMode)
  }, [])

  // Recalcular la página actual cuando cambia el modo de visualización
  useEffect(() => {
    setCurrentPage(1)
  }, [viewMode])

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, data.length)
  const currentData = data.slice(startIndex, endIndex)

  const formatCurrency = (value: number) => {
    // Usar notación compacta en móviles para valores grandes
    const notation = viewMode === "cards" && Math.abs(value) > 9999 ? "compact" : "standard"

    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: viewMode === "cards" ? 0 : 2,
      maximumFractionDigits: 2,
      notation: notation as Intl.NumberFormatOptions["notation"],
    }).format(value)
  }

  const formatDate = (date: Date) => {
    // Formato más compacto para móviles y tablets
    if (viewMode === "cards") {
      return date.toLocaleDateString("es-PE", {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
      })
    }

    // Formato completo para pantallas más grandes
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getGraceLabel = (isGracePeriod: "none" | "total" | "partial") => {
    if (isGracePeriod === "total") return viewMode === "cards" ? "G.T" : "Gracia Total"
    if (isGracePeriod === "partial") return viewMode === "cards" ? "G.P" : "Gracia Parcial"
    return ""
  }

  // Renderizar tarjetas para móvil y tablet
  const renderCards = () => {
    return (
      <div className="space-y-3">
        {currentData.map((row) => (
          <Card key={row.period} className={`p-3 ${row.isGracePeriod !== "none" ? "bg-slate-50" : ""}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="font-bold text-lg">{row.period}</span>
                {row.isGracePeriod !== "none" && (
                  <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {row.isGracePeriod === "total" ? "Gracia Total" : "Gracia Parcial"}
                  </span>
                )}
              </div>
              <div className="flex items-center text-slate-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="text-xs">{formatDate(row.date)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <DataItem
                label="Interés"
                value={formatCurrency(row.interest)}
                icon={<DollarSign className="h-3 w-3 text-blue-500" />}
              />
              <DataItem
                label="Cuota"
                value={formatCurrency(row.payment)}
                icon={<ArrowDownUp className="h-3 w-3 text-purple-500" />}
              />
              <DataItem
                label="Flujo emisor"
                value={formatCurrency(row.issuerFlow)}
                icon={<ArrowDown className="h-3 w-3 text-red-500" />}
              />
              <DataItem
                label="Flujo inversionista"
                value={formatCurrency(row.investorFlow)}
                icon={<ArrowUp className="h-3 w-3 text-green-500" />}
              />
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <span className="block">Saldo inicial:</span>
                <span className="font-medium text-slate-700">{formatCurrency(row.initialBalance)}</span>
              </div>
              <div>
                <span className="block">Saldo final:</span>
                <span className="font-medium text-slate-700">{formatCurrency(row.finalBalance)}</span>
              </div>
              {row.amortization > 0 && (
                <div>
                  <span className="block">Amortización:</span>
                  <span className="font-medium text-slate-700">{formatCurrency(row.amortization)}</span>
                </div>
              )}
              {row.premium > 0 && (
                <div>
                  <span className="block">Prima:</span>
                  <span className="font-medium text-slate-700">{formatCurrency(row.premium)}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  // Renderizar tabla para desktop
  const renderTable = () => {
    return (
      <div className={`rounded-md border overflow-hidden ${viewMode === "scroll" ? "overflow-x-auto" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Nº</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Saldo inicial</TableHead>
              <TableHead className="text-right">Interés</TableHead>
              <TableHead className="text-right">Cuota</TableHead>
              <TableHead className="text-right">Amortización</TableHead>
              <TableHead className="text-right">Saldo final</TableHead>
              <TableHead className="text-right">Prima</TableHead>
              <TableHead className="text-right">Flujo emisor</TableHead>
              <TableHead className="text-right">Flujo inversionista</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row) => (
              <TableRow key={row.period} className={row.isGracePeriod !== "none" ? "bg-slate-50" : ""}>
                <TableCell className="font-medium">
                  {row.period}
                  {row.isGracePeriod !== "none" && (
                    <span className="ml-2 text-xs text-slate-500">{getGraceLabel(row.isGracePeriod)}</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(row.date)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.initialBalance)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.interest)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
                <TableCell className="text-right">
                  {row.amortization === 0 ? "—" : formatCurrency(row.amortization)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(row.finalBalance)}</TableCell>
                <TableCell className="text-right">{row.premium === 0 ? "—" : formatCurrency(row.premium)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.issuerFlow)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.investorFlow)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div>
      {/* Renderizar según el modo de visualización */}
      {viewMode === "cards" ? renderCards() : renderTable()}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-2">
          <div className="text-xs sm:text-sm text-slate-500">
            Mostrando {startIndex + 1}-{endIndex} de {data.length} filas
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente auxiliar para mostrar un dato en las tarjetas
function DataItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center text-xs text-slate-500 mb-0.5">
        {icon}
        <span className="ml-1">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  )
}
