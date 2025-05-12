"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

export function BondResultTable({ data }: BondResultTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  const totalPages = Math.ceil(data.length / rowsPerPage)

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, data.length)
  const currentData = data.slice(startIndex, endIndex)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getGraceLabel = (isGracePeriod: "none" | "total" | "partial") => {
    if (isGracePeriod === "total") return "Gracia Total"
    if (isGracePeriod === "partial") return "Gracia Parcial"
    return ""
  }

  return (
    <div>
      <div className="rounded-md border overflow-hidden">
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

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Mostrando {startIndex + 1}-{endIndex} de {data.length} filas
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
