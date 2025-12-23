"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth/auth-context"
import { LogOut, User } from "lucide-react"

interface DashboardHeaderProps {
  /**
   * Props opcionales para mantener compatibilidad con páginas existentes.
   * Si no se envían, se intentará tomar la información desde el AuthContext.
   */
  userName?: string
  userRole?: string
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const { user } = useAuth()

  const resolvedUserName = (userName || user?.fullName || user?.username || "Usuario").trim()
  const resolvedUserRole = (userRole || user?.role || "").toString()

  const initials = resolvedUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-end gap-4 border-b border-border bg-card px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium text-foreground">{resolvedUserName}</span>
              <span className="text-xs text-muted-foreground">{resolvedUserRole}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
