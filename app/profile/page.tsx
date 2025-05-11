"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "../components/sidebar"

export default function ProfilePage() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "Administrador",
    email: "admin@ejemplo.com",
    phone: "+51 999 888 777",
    company: "Monetix S.A.",
    role: "Administrador",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsEditing(false)
    toast({
      title: "Perfil actualizado",
      description: "Tus datos han sido actualizados correctamente",
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

          <h1 className="text-2xl font-bold text-slate-800 mb-6">Mi Perfil</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Información Personal</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Perfil</CardTitle>
                    <CardDescription>Tu información pública</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-medium">{formData.name}</h3>
                    <p className="text-sm text-slate-500">{formData.email}</p>
                    <p className="text-sm text-slate-500 mt-1">{formData.role}</p>
                  </CardContent>
                </Card>

                {/* Profile Details */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Actualiza tus datos personales</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Cargo</Label>
                        <Input
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSave}>Guardar cambios</Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>Administra tu contraseña y seguridad de la cuenta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña actual</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Actualizar contraseña</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
