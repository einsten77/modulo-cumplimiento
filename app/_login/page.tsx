"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login(formData)
    } catch (err: any) {
      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        setError("Credenciales inválidas. Por favor verifique sus datos.")
      } else if (err.message?.includes("403") || err.message?.includes("Forbidden")) {
        setError("Su cuenta está inactiva o suspendida. Contacte al administrador.")
      } else if (err.message?.includes("423") || err.message?.includes("Locked")) {
        setError("Cuenta bloqueada temporalmente. Contacte al administrador.")
      } else {
        setError(err.message || "Error al iniciar sesión. Intente nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Image
                src="/images/logo-occidental.png"
                alt="Seguros La Occidental"
                width={400}
                height={120}
                className="h-20 w-auto object-contain"
                priority
              />
              <div className="border-l border-border pl-6">
                <h1 className="text-lg font-bold text-foreground leading-tight">C.A. de Seguros La Occidental</h1>
                <p className="text-sm text-muted-foreground mt-0.5">RIF: J-07001130-0</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Empresa de Seguros Autorizada bajo el código ES-000051
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <span className="text-sm font-semibold text-primary">V1.0</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary px-8 py-10 text-center">
              <div className="flex justify-center mb-4">
                <ShieldCheck className="h-16 w-16 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-primary-foreground mb-2 text-balance">SAGRA</h2>
              <p className="text-primary-foreground/90 text-sm font-medium text-balance">
                Sistema Automatizado de Gestión de Riesgos
              </p>
            </div>

            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                    Usuario
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={isLoading}
                    className="h-11 bg-muted/30 border-border focus:border-primary"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={isLoading}
                      className="h-11 pr-10 bg-muted/30 border-border focus:border-primary"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-border space-y-3">
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">Oficial de Cumplimiento</p>
                  <p className="text-sm font-bold text-primary">Cristina Uzcategui</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-center text-muted-foreground text-balance">
                    Sistema bajo supervisión permanente de SUDEASEG
                  </p>
                  <p className="text-xs text-center text-muted-foreground text-balance">
                    Todos los accesos son registrados para auditoría
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
