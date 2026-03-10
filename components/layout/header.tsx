"use client"

import Image from "next/image"
import { useAuth } from "@/lib/auth/auth-context"
import { ROLE_LABELS } from "@/lib/constants/roles"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Image
            src="/images/logo-occidental.png"
            alt="Seguros La Occidental"
            width={300}
            height={90}
            className="h-14 w-auto object-contain"
            priority
          />
          <div className="border-l border-border pl-4">
            <h1 className="text-lg font-semibold text-foreground">Sistema Automatizado de Gestión de Riesgos</h1>
            <p className="text-xs text-muted-foreground">Regulado por SUDEASEG</p>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.username}</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
