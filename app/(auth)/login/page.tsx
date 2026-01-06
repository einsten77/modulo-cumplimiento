"use client"


import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, AlertCircle, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const isAdminAccess = username.toUpperCase() === "ADMIN"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login({ username, password })
      // Redirect handled by auth context
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error de autenticación. Por favor intente nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/30 via-muted/10 to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="mx-auto flex items-center justify-center">
            <Image
              src="/images/logo-occidental.png"
              alt="Seguros La Occidental"
              width={400}
              height={100}
              className="h-auto w-full max-w-sm"
              priority
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">SAGIRC</CardTitle>
            <CardDescription className="text-sm">
              Sistema Automatizado de Gestión Integral de Riesgos y Cumplimiento
              <br />
              <span className="font-medium">C.A. de Seguros La Occidental</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAdminAccess && (
            <Alert className="border-warning bg-warning/10">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <AlertDescription className="text-sm text-warning">
                <strong>Acceso Administrativo Temporal</strong>
                <br />
                Este acceso está bajo auditoría permanente
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Usuario Corporativo
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ejemplo: jmperez"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                required
                disabled={isLoading}
                className="h-11"
                autoComplete="username"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Ingrese su usuario corporativo (sin el dominio @laoccidental.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
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

          <div className="text-center">
            <Link
              href="/auth/recuperar-contrasena"
              className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-foreground">Oficial de Cumplimiento</p>
              <p className="text-sm font-bold text-primary">Cristina Uzcategui</p>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-xs text-muted-foreground">Sistema bajo supervisión de SUDEASEG</p>
              <p className="text-xs text-muted-foreground">Todos los accesos son registrados para auditoría</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
