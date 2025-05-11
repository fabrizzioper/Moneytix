"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function RedirectPage() {
  const router = useRouter()

  // Redirect to the new location
  if (typeof window !== "undefined") {
    router.push("/bonds/create")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Redirigiendo...</h1>
      <p className="text-slate-600">Estás siendo redirigido a la página de creación de bonos.</p>
    </div>
  )
}
