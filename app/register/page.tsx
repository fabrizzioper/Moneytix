"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullNameError, setFullNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validate full name
  const validateFullName = (value: string) => {
    if (!value.trim()) {
      setFullNameError("El nombre no puede estar vacío")
      return false
    }
    setFullNameError("")
    return true
  }

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

  // Validate confirm password
  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError("Las contraseñas no coinciden")
      return false
    }
    setConfirmPasswordError("")
    return true
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Final validation
    const isFullNameValid = validateFullName(fullName)
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)

    if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return
    }

    setIsLoading(true)

    // Simulate account creation
    setTimeout(() => {
      // In a real app, you would send the data to your backend
      // Reset form and redirect to login
      setFullName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setIsLoading(false)

      // Redirect to login with success message
      router.push("/login?message=Cuenta creada; inicia sesión con tus datos")
    }, 1500)
  }

  // Check if button should be disabled
  const isButtonDisabled =
    !fullName.trim() || !email.includes("@") || password.length < 5 || password !== confirmPassword || isLoading

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-12">
            <Image src="/monetix-logo.png" alt="Monetix Logo" width={180} height={50} priority />
          </div>

          {/* Form header */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-1">Comienza tu experiencia</p>
            <h1 className="text-2xl font-bold text-slate-800">Crear cuenta</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm text-slate-600 font-normal">
                Nombre completo
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (e.target.value) validateFullName(e.target.value)
                }}
                onBlur={(e) => validateFullName(e.target.value)}
                placeholder="Juan Pérez"
                className="border-slate-200"
              />
              {fullNameError && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {fullNameError}
                </p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-slate-600 font-normal">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (e.target.value) validateEmail(e.target.value)
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="border-slate-200"
              />
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
                    if (e.target.value) {
                      validatePassword(e.target.value)
                      if (confirmPassword) validateConfirmPassword(confirmPassword)
                    }
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

            {/* Confirm Password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-slate-600 font-normal">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (e.target.value) validateConfirmPassword(e.target.value)
                  }}
                  onBlur={(e) => validateConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="border-slate-200 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={14} />
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 h-11 mt-6"
              disabled={isButtonDisabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="text-green-500 hover:underline">
              Volver a Iniciar sesión
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
