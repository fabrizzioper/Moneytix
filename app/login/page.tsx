"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    // Check for success message in URL
    const message = searchParams.get("message")
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  // Validate email
  const validateEmail = (value: string) => {
    if (!value.includes("@")) {
      setEmailError('El correo debe contener "@"')
      return false
    }
    setEmailError("")
    return true
  }

  // Validate password
  const validatePassword = (value: string) => {
    if (value.length < 5) {
      setPasswordError("La contraseña requiere al menos 5 caracteres")
      return false
    }
    setPasswordError("")
    return true
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    // Final validation
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsLoading(true)

    // Check credentials
    if (email === "admin@ejemplo.com" && password === "12345") {
      // Simulate loading
      setTimeout(() => {
        // Store authentication state in a cookie instead of sessionStorage
        document.cookie = "isAuthenticated=true; path=/"
        router.push("/bonds")
      }, 1000)
    } else {
      setIsLoading(false)
      setLoginError("Credenciales inválidas")
    }
  }

  // Check if button should be disabled
  const isButtonDisabled = !email.includes("@") || password.length < 5 || isLoading

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-12">
            <Image src="/monetix-logo.png" alt="Monetix Logo" width={120} height={20} priority />
          </div>

          {/* Success message */}
          {successMessage && (
            <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Form header */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-1">Bienvenido de nuevo</p>
            <h1 className="text-2xl font-bold text-slate-800">Iniciar sesión</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-600 font-normal">
                Correo electrónico
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (e.target.value) validateEmail(e.target.value)
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="admin@ejemplo.com"
                  className="border-slate-200 pr-10"
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-600 font-normal">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (e.target.value) validatePassword(e.target.value)
                  }}
                  onBlur={(e) => validatePassword(e.target.value)}
                  placeholder="••••••"
                  className="border-slate-200 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 h-11"
              disabled={isButtonDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            {/* Error message */}
            {loginError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
          </form>

          {/* Register link */}
          <div className="mt-8 text-center text-sm text-slate-500">
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="text-green-500 hover:underline">
              Regístrate
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Decorative background */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
        <Image src="/fluid-background.png" alt="Decorative background" fill className="object-cover" priority />
      </div>
    </div>
  )
}
