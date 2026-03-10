"use client"

import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface DashboardHeaderProps {
  userName?: string | null
  userRole?: string | null
  onLogout?: () => void
}

function getInitials(name: string) {
  const clean = (name || "").trim()
  if (!clean) return "U"

  const parts = clean.split(/\s+/).filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  return initials || "U"
}

export function DashboardHeader({ userName, userRole, onLogout }: DashboardHeaderProps) {
  const safeName = (userName ?? "").trim() || "Usuario"
  const initials = getInitials(safeName)

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-foreground">Sistema Automatizado de Gestión de Riesgos</h1>
        <p className="text-sm text-muted-foreground">Regulado por SUDEASEG</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-foreground">{safeName}</div>
            <div className="text-xs text-muted-foreground">{userRole || "—"}</div>
          </div>
          <User className="h-4 w-4 text-muted-foreground" />
        </div>

        {onLogout && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        )}
      </div>
    </header>
  )
}
