"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Chart from "chart.js/auto"

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

interface BondResultChartProps {
  data: CashFlowData[]
  hideGracePeriods: boolean
}

export function BondResultChart({ data, hideGracePeriods }: BondResultChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Filtrar los datos según la opción de ocultar periodos de gracia
    const filteredData = hideGracePeriods ? data.filter((d) => d.period === 0 || d.isGracePeriod !== "total") : data

    // Preparar los datos para el gráfico
    const labels = filteredData.map((d) => (d.period === 0 ? "Inicio" : `Periodo ${d.period}`))
    const interestData = filteredData.map((d) => d.interest)
    const amortizationData = filteredData.map((d) => d.amortization)
    const balanceData = filteredData.map((d) => d.finalBalance)

    // Crear el gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Interés",
              data: interestData,
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
              stack: "Stack 0",
            },
            {
              label: "Amortización",
              data: amortizationData,
              backgroundColor: "rgba(16, 185, 129, 0.7)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
              stack: "Stack 0",
            },
            {
              label: "Saldo",
              data: balanceData,
              type: "line",
              borderColor: "rgba(244, 63, 94, 1)",
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointBackgroundColor: "rgba(244, 63, 94, 1)",
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.dataset.label || ""
                  if (label) {
                    label += ": "
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "USD",
                    }).format(context.parsed.y)
                  }
                  return label
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: "Periodo",
              },
            },
            y: {
              stacked: true,
              title: {
                display: true,
                text: "Monto (USD)",
              },
              ticks: {
                callback: (value) =>
                  new Intl.NumberFormat("es-PE", {
                    style: "currency",
                    currency: "USD",
                    notation: "compact",
                  }).format(value as number),
              },
            },
            y1: {
              position: "right",
              title: {
                display: true,
                text: "Saldo (USD)",
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: (value) =>
                  new Intl.NumberFormat("es-PE", {
                    style: "currency",
                    currency: "USD",
                    notation: "compact",
                  }).format(value as number),
              },
            },
          },
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, hideGracePeriods])

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-80">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-[500px]">
      <canvas ref={chartRef} />
    </div>
  )
}
