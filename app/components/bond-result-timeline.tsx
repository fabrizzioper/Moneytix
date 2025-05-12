"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

interface BondResultTimelineProps {
  data: CashFlowData[]
}

export function BondResultTimeline({ data }: BondResultTimelineProps) {
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

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

      {/* Tarjetas de periodos */}
      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.period} className="relative pl-10">
            {/* Círculo en la línea */}
            <div
              className={`absolute left-4 top-6 w-4 h-4 rounded-full -translate-x-1/2 ${
                item.period === 0
                  ? "bg-green-500"
                  : item.isGracePeriod === "total"
                    ? "bg-amber-500"
                    : item.isGracePeriod === "partial"
                      ? "bg-blue-500"
                      : "bg-slate-500"
              }`}
            />

            <Card
              className={`${
                item.isGracePeriod === "total"
                  ? "border-amber-200 bg-amber-50"
                  : item.isGracePeriod === "partial"
                    ? "border-blue-200 bg-blue-50"
                    : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="font-bold text-lg mr-2">Periodo {item.period}</span>
                      <span className="text-slate-500">{formatDate(item.date)}</span>

                      {item.isGracePeriod === "total" && (
                        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                          Gracia Total
                        </Badge>
                      )}

                      {item.isGracePeriod === "partial" && (
                        <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                          Gracia Parcial
                        </Badge>
                      )}

                      {item.premium > 0 && (
                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                          Prima
                        </Badge>
                      )}
                    </div>

                    {item.period === 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-slate-500">Desembolso inicial</p>
                          <p className="font-medium">{formatCurrency(Math.abs(item.investorFlow))}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Valor nominal</p>
                          <p className="font-medium">{formatCurrency(item.finalBalance)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-slate-500">Cuota</p>
                          <p className="font-medium">{formatCurrency(item.payment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Interés</p>
                          <p className="font-medium">{formatCurrency(item.interest)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Amortización</p>
                          <p className="font-medium">
                            {item.amortization === 0 ? "—" : formatCurrency(item.amortization)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {item.period > 0 && (
                    <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                      <p className="text-sm text-slate-500">Saldo pendiente</p>
                      <p className="font-medium">{formatCurrency(item.finalBalance)}</p>

                      {item.premium > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-slate-500">Prima</p>
                          <p className="font-medium text-green-600">{formatCurrency(item.premium)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
