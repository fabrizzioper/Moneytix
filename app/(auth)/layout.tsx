"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, User, Settings, LogOut, Menu, ChevronRight, BarChart3 } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Check if user is authenticated on component mount
  useEffect(() => {
    setIsMounted(true)
    const isAuthenticated = document.cookie.includes("isAuthenticated=true")
    if (!isAuthenticated) {
      router.push("/login?message=Inicia sesión para continuar")
    }
  }, [router])

  // Handle logout
  const handleLogout = () => {
    // Clear authentication cookie
    document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    // Redirect to login
    router.push("/login")
  }

  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      href: "/bonds",
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: "Mis Bonos",
      href: "/bonds",
      icon: <BarChart3 size={20} />,
    },
    {
      title: "Mi Perfil",
      href: "/profile",
      icon: <User size={20} />,
    },
    {
      title: "Configuración",
      href: "/settings",
      icon: <Settings size={20} />,
    },
  ]

  // Don't render anything on the server to avoid hydration errors
  if (!isMounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        {/* Logo */}
        <div className="p-6">
          <Image src="/monetix-logo.png" alt="Monetix Logo" width={120} height={30} priority />
        </div>

        <Separator />

        {/* User profile section */}
        <div className="flex items-center gap-3 p-6">
          <Avatar>
            <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Administrador</p>
            <p className="text-xs text-slate-500">admin@ejemplo.com</p>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    pathname === item.href
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 mt-auto">
          <Button
            variant="outline"
            className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="p-6">
                <Image src="/monetix-logo.png" alt="Monetix Logo" width={120} height={30} priority />
              </div>

              <Separator />

              {/* User profile section */}
              <div className="flex items-center gap-3 p-6">
                <Avatar>
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Administrador</p>
                  <p className="text-xs text-slate-500">admin@ejemplo.com</p>
                </div>
              </div>

              <Separator />

              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                          pathname === item.href
                            ? "bg-slate-100 text-slate-900 font-medium"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon}
                          {item.title}
                        </span>
                        <ChevronRight size={16} className="text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <Separator />

              {/* Logout button */}
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={handleLogout}
                >
                  <LogOut size={20} className="mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Image src="/monetix-logo.png" alt="Monetix Logo" width={100} height={24} className="ml-2" priority />
        </div>

        <Avatar className="h-8 w-8">
          <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        <div className="md:p-0 pb-16 md:pb-0 mt-16 md:mt-0">{children}</div>
      </main>
    </div>
  )
}
