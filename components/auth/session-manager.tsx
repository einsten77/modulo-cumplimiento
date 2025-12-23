"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const WARNING_THRESHOLD = 2 * 60 * 1000 // 2 minutes

export function SessionManager() {
  const { sessionExpiresAt, extendSession, logout, isAuthenticated } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  useEffect(() => {
    if (!isAuthenticated || !sessionExpiresAt) {
      setShowWarning(false)
      return
    }

    const interval = setInterval(() => {
      const remaining = sessionExpiresAt - Date.now()

      if (remaining <= 0) {
        setShowWarning(false)
        clearInterval(interval)
        return
      }

      setTimeRemaining(remaining)

      // Show warning when 2 minutes remaining
      if (remaining <= WARNING_THRESHOLD && !showWarning) {
        setShowWarning(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionExpiresAt, isAuthenticated, showWarning])

  const handleExtendSession = () => {
    extendSession()
    setShowWarning(false)
  }

  const handleLogout = () => {
    setShowWarning(false)
    logout()
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const progressValue = ((WARNING_THRESHOLD - timeRemaining) / WARNING_THRESHOLD) * 100

  if (!showWarning) return null

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <AlertCircle className="h-5 w-5" />
            Su sesión está por expirar
          </DialogTitle>
          <DialogDescription>
            Por seguridad, su sesión se cerrará automáticamente debido a inactividad. ¿Desea continuar trabajando?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-3 rounded-lg bg-warning/10 p-4">
            <Clock className="h-6 w-6 text-warning" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tiempo restante</p>
              <p className="text-3xl font-bold text-warning">{formatTime(timeRemaining)}</p>
            </div>
          </div>

          <Progress value={progressValue} className="h-2" />

          <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Características de seguridad:</p>
            <ul className="ml-4 space-y-1 list-disc">
              <li>Cierre automático de sesión tras 30 minutos de inactividad</li>
              <li>Advertencia 2 minutos antes del cierre</li>
              <li>Limpieza completa de datos sensibles al cerrar sesión</li>
              <li>Validación continua de tokens JWT</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
            Cerrar Sesión
          </Button>
          <Button onClick={handleExtendSession} className="gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white">
            <Clock className="h-4 w-4" />
            Continuar Trabajando
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
