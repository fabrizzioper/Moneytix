"use client"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Sidebar } from "../../components/sidebar"

export default function BondDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bondId = params.id

  // Si el ID es "new" o "create", redirigir a la página correcta
  if (bondId === "new" || bondId === "create") {
    if (typeof window !== "undefined") {
      router.push("/bonds/form/new")
      return null
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar currentPath={`/bonds`} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-8 pt-20">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <h1 className="text-2xl font-bold text-slate-800 mb-6">Detalle del Bono</h1>

          <p className="text-slate-600">Esta página mostrará los detalles del bono con ID: {bondId}</p>
        </div>
      </div>
    </div>
  )
}
