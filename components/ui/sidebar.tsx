"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, User, Settings, LogOut, Menu, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  currentPath: string
}

export function Sidebar({ currentPath }: SidebarProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const sidebarRef = useRef<HTMLDivElement>(null)

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
      title: "Mis Bonos",
      href: "/bonds",
      icon: <LayoutDashboard size={20} />,
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

  // Handle clicks outside the sidebar to collapse it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expanded && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setExpanded(false)
      }
    }

    // Add event listener when sidebar is expanded
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [expanded])

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 h-screen transition-all duration-300 ${
          expanded ? "w-64" : "w-20"
        }`}
      >
        {/* Logo and Toggle Button */}
        <div className={`p-4 flex ${expanded ? "justify-between" : "justify-center"} items-center`}>
          {expanded ? (
            <Image src="/monetix-logo.png" alt="Monetix Logo" width={120} height={30} priority />
          ) : (
            <Image src="/monetix-logo-icon.png" alt="Monetix Logo" width={32} height={32} priority />
          )}
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="hover:bg-slate-100">
            {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>

        <Separator />

        {/* User profile section */}
        <div className={`flex items-center ${expanded ? "gap-3 p-4" : "flex-col p-3"}`}>
          <Avatar className={expanded ? "h-10 w-10" : "h-8 w-8 mb-1"}>
            <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          {expanded && (
            <div>
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-xs text-slate-500">admin@ejemplo.com</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center ${
                    expanded ? "justify-start gap-3 px-3" : "justify-center"
                  } py-2 rounded-md text-sm ${
                    currentPath.startsWith(item.href)
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  {expanded && <span>{item.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className={`p-2 mt-auto ${!expanded && "flex justify-center"}`}>
          <Button
            variant="outline"
            className={`${
              expanded ? "w-full justify-start text-slate-600" : "w-10 h-10 p-0 flex items-center justify-center"
            } hover:text-slate-900 hover:bg-slate-100`}
            onClick={handleLogout}
          >
            <LogOut size={20} className={expanded ? "mr-2" : ""} />
            {expanded && "Cerrar sesión"}
          </Button>
        </div>
      </aside>

      {/* Mobile Header and Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
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
                        prefetch={true}
                        className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                          currentPath.startsWith(item.href)
                            ? "bg-slate-100 text-slate-900 font-medium"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon}
                          {item.title}
                        </span>
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
    </>
  )
}
