"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "../components/sidebar"

export default function SettingsPage() {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas",
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

          <h1 className="text-2xl font-bold text-slate-800 mb-6">Configuración</h1>

          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="preferences">Preferencias</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              <TabsTrigger value="appearance">Apariencia</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias generales</CardTitle>
                  <CardDescription>Configura tus preferencias de la aplicación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="currency" className="text-base">
                        Moneda predeterminada
                      </Label>
                      <p className="text-sm text-slate-500">Establece la moneda predeterminada para nuevos bonos</p>
                    </div>
                    <select id="currency" className="px-3 py-2 border rounded-md">
                      <option value="PEN">PEN - Soles</option>
                      <option value="USD">USD - Dólares</option>
                      <option value="EUR">EUR - Euros</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="language" className="text-base">
                        Idioma
                      </Label>
                      <p className="text-sm text-slate-500">Selecciona el idioma de la interfaz</p>
                    </div>
                    <select id="language" className="px-3 py-2 border rounded-md">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="text-base">
                        Guardado automático
                      </Label>
                      <p className="text-sm text-slate-500">Guardar automáticamente los cambios en bonos</p>
                    </div>
                    <Switch id="auto-save" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>Guardar preferencias</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                  <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-base">
                        Notificaciones por correo
                      </Label>
                      <p className="text-sm text-slate-500">Recibir notificaciones por correo electrónico</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="updates" className="text-base">
                        Actualizaciones del sistema
                      </Label>
                      <p className="text-sm text-slate-500">Recibir notificaciones sobre actualizaciones</p>
                    </div>
                    <Switch id="updates" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing" className="text-base">
                        Comunicaciones de marketing
                      </Label>
                      <p className="text-sm text-slate-500">Recibir ofertas y novedades</p>
                    </div>
                    <Switch id="marketing" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>Guardar preferencias</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Apariencia</CardTitle>
                  <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme" className="text-base">
                        Tema
                      </Label>
                      <p className="text-sm text-slate-500">Selecciona el tema de la aplicación</p>
                    </div>
                    <select id="theme" className="px-3 py-2 border rounded-md">
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="system">Sistema</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="density" className="text-base">
                        Densidad de la interfaz
                      </Label>
                      <p className="text-sm text-slate-500">Ajusta el espaciado de los elementos</p>
                    </div>
                    <select id="density" className="px-3 py-2 border rounded-md">
                      <option value="compact">Compacta</option>
                      <option value="normal">Normal</option>
                      <option value="comfortable">Cómoda</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="animations" className="text-base">
                        Animaciones
                      </Label>
                      <p className="text-sm text-slate-500">Habilitar animaciones en la interfaz</p>
                    </div>
                    <Switch id="animations" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>Guardar preferencias</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
