"use client"

import { Loader2 } from "lucide-react"

interface FullPageLoaderProps {
  message?: string
}

export function FullPageLoader({ message = "Calculando resultados..." }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className=" p-8 rounded-lg  flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
        <p className="text-lg font-medium text-slate-800">{message}</p>
        <p className="text-sm text-slate-500 mt-2">Esto puede tomar unos segundos...</p>
      </div>
    </div>
  )
}
