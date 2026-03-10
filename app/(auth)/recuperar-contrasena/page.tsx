"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { ShieldCheck, AlertCircle, Loader2, CheckCircle2, Mail, ArrowLeft } from "lucide-react"

export default function PasswordRecoveryPage() {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [corporateEmail, setCorporateEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.toLowerCase().trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al solicitar recuperación de contraseña")
      }

      setCorporateEmail(data.corporateEmail)
      setSuccess(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error al procesar la solicitud. Por favor intente nuevamente.")
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
            <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-sm">
              Ingrese su usuario corporativo para recibir instrucciones de recuperación
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!success ? (
            <>
              <Alert className="border-primary/30 bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm text-foreground">
                  <strong>Nota Importante:</strong>
                  <br />
                  La nueva contraseña será enviada a su correo corporativo registrado
                </AlertDescription>
              </Alert>

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
                  <p className="text-xs text-muted-foreground">Ingrese su usuario (sin @laoccidental.com)</p>
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
                      Procesando solicitud...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Instrucciones
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-sm text-success">
                  <strong>Solicitud procesada exitosamente</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Mail className="h-8 w-8 text-success" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Revise su correo corporativo</h3>
                  <p className="text-sm text-muted-foreground">
                    Se han enviado las instrucciones para restablecer su contraseña a:
                  </p>
                  <p className="text-sm font-semibold text-foreground">{corporateEmail}</p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-left">
                  <p className="text-sm font-medium">Próximos pasos:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Revise su bandeja de entrada y carpeta de spam</li>
                    <li>Utilice la contraseña temporal proporcionada</li>
                    <li>Cambie su contraseña en el primer acceso</li>
                  </ol>
                </div>

                <Alert className="border-warning/30 bg-warning/10 text-left">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-xs text-warning">
                    Por seguridad, esta solicitud ha sido registrada en auditoría
                  </AlertDescription>
                </Alert>
              </div>

              <Button asChild className="w-full h-11 font-semibold">
                <Link href="/auth/login">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Volver al Inicio de Sesión
                </Link>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t space-y-2 text-center">
            <p className="text-xs text-muted-foreground">¿Tiene problemas para recuperar su contraseña?</p>
            <p className="text-xs text-muted-foreground">
              Contacte al <span className="font-semibold text-foreground">Departamento de Cumplimiento</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
