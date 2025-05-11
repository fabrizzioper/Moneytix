"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, Plus, ArrowUpDown, Eye, Copy, Trash2 } from "lucide-react"
import { Sidebar } from "../components/sidebar"

// Define the Bond type
interface Bond {
  id: string
  code: string
  creationDate: Date
  currency: "PEN" | "USD" | "EUR"
  nominalValue: number
  term: number
}

// Sample data for demonstration
const sampleBonds: Bond[] = [
  {
    id: "1",
    code: "BON-001",
    creationDate: new Date(2025, 4, 5),
    currency: "USD",
    nominalValue: 10000,
    term: 5,
  },
  {
    id: "2",
    code: "BON-002",
    creationDate: new Date(2025, 4, 8),
    currency: "PEN",
    nominalValue: 50000,
    term: 3,
  },
  {
    id: "3",
    code: "BON-003",
    creationDate: new Date(2025, 4, 10),
    currency: "EUR",
    nominalValue: 15000,
    term: 7,
  },
]

export default function BondsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // State for bonds list
  const [bonds, setBonds] = useState<Bond[]>([])

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [currencyFilter, setCurrencyFilter] = useState<string>("all")

  // State for sorting
  const [sortField, setSortField] = useState<"code" | "creationDate">("creationDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bondToDelete, setBondToDelete] = useState<Bond | null>(null)

  // Load sample data on component mount
  useEffect(() => {
    // In a real app, you would fetch this from an API
    setBonds(sampleBonds)
  }, [])

  // Handle sorting
  const handleSort = (field: "code" | "creationDate") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filter and sort bonds
  const filteredAndSortedBonds = bonds
    .filter((bond) => {
      // Apply search filter
      const matchesSearch = bond.code.toLowerCase().includes(searchQuery.toLowerCase())

      // Apply currency filter
      const matchesCurrency = currencyFilter === "all" || bond.currency === currencyFilter

      return matchesSearch && matchesCurrency
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === "code") {
        return sortDirection === "asc" ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code)
      } else {
        return sortDirection === "asc"
          ? a.creationDate.getTime() - b.creationDate.getTime()
          : b.creationDate.getTime() - a.creationDate.getTime()
      }
    })

  // Handle open bond
  const handleOpenBond = (id: string) => {
    router.push(`/bonds/${id}`)
  }

  // Handle duplicate bond
  const handleDuplicateBond = (bond: Bond) => {
    // Generate new code
    const newCode = `BON-${String(bonds.length + 1).padStart(3, "0")}`

    // Create duplicate with new ID and code
    const duplicatedBond: Bond = {
      ...bond,
      id: String(bonds.length + 1),
      code: newCode,
      creationDate: new Date(),
    }

    // Add to bonds list
    setBonds([...bonds, duplicatedBond])

    // Show success toast
    toast({
      title: "Bono duplicado",
      description: `Se ha creado una copia como ${newCode}`,
    })

    // Navigate to edit form with pre-filled data
    router.push(`/bonds/form/new?duplicate=${duplicatedBond.id}`)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = (bond: Bond) => {
    setBondToDelete(bond)
    setDeleteDialogOpen(true)
  }

  // Handle actual deletion
  const handleDelete = () => {
    if (bondToDelete) {
      // Remove bond from list
      setBonds(bonds.filter((bond) => bond.id !== bondToDelete.id))

      // Show success toast
      toast({
        title: "Bono eliminado",
        description: `El bono ${bondToDelete.code} ha sido eliminado`,
      })

      // Close dialog
      setDeleteDialogOpen(false)
      setBondToDelete(null)
    }
  }

  // Format currency
  const formatCurrency = (value: number, currency: string) => {
    const formatter = new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    })
    return formatter.format(value)
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar currentPath={pathname} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 md:pt-8 pt-20">
          <Toaster />

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Mis Bonos</h1>
              <p className="text-slate-500 mt-1">Selecciona un bono o crea uno nuevo</p>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => router.push("/bonds/form/new")}
                    className="mt-4 md:mt-0 bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo bono
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comienza una nueva valoración con el método francés</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Buscar por código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las monedas</SelectItem>
                <SelectItem value="PEN">PEN - Soles</SelectItem>
                <SelectItem value="USD">USD - Dólares</SelectItem>
                <SelectItem value="EUR">EUR - Euros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Empty state */}
          {bonds.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
             
              <h3 className="text-lg font-medium text-slate-700 mb-2">Aún no has creado ningún bono</h3>
              <p className="text-slate-500 mb-6">Comienza creando tu primer bono para ver los resultados aquí</p>
              <Button onClick={() => router.push("/bonds/form/new")} className="bg-green-500 hover:bg-green-600">
                <Plus className="mr-2 h-4 w-4" />
                Crear mi primer bono
              </Button>
            </div>
          ) : (
            <>
              {/* Bonds table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("code")}>
                        <div className="flex items-center">
                          Código
                          {sortField === "code" && <ArrowUpDown size={16} className="ml-2" />}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("creationDate")}>
                        <div className="flex items-center">
                          Fecha de creación
                          {sortField === "creationDate" && <ArrowUpDown size={16} className="ml-2" />}
                        </div>
                      </TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead className="text-right">Valor nominal</TableHead>
                      <TableHead className="text-center">Plazo (años)</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedBonds.map((bond) => (
                      <TableRow key={bond.id}>
                        <TableCell className="font-medium">{bond.code}</TableCell>
                        <TableCell>{formatDate(bond.creationDate)}</TableCell>
                        <TableCell>{bond.currency}</TableCell>
                        <TableCell className="text-right">{formatCurrency(bond.nominalValue, bond.currency)}</TableCell>
                        <TableCell className="text-center">{bond.term}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenBond(bond.id)} title="Abrir">
                              <Eye size={18} className="text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicateBond(bond)}
                              title="Duplicar"
                            >
                              <Copy size={18} className="text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteConfirm(bond)}
                              title="Eliminar"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Session note */}
              <p className="text-xs text-slate-400 mt-4 text-center">
                Tus bonos se guardan mientras dure la sesión actual
              </p>
            </>
          )}

          {/* Delete confirmation dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogDescription>
                  ¿Deseas borrar el bono {bondToDelete?.code}? Esta acción es irreversible.
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

          {/* Mobile FAB */}
          <div className="md:hidden fixed bottom-6 right-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => router.push("/bonds/form/new")}
                    className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
                  >
                    <Plus size={24} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Comienza una nueva valoración con el método francés</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
