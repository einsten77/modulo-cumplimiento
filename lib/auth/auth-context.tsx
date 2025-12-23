"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export type RoleType =
  | "OFICIAL_CUMPLIMIENTO"
  | "USUARIO_RRHH"
  | "USUARIO_COMERCIAL"
  | "CONSULTOR"
  | "AUDITOR_INTERNO"
  | "REGULADOR_SUDEASEG"
  | "AUDITOR_EXTERNO"

export type UserStatus = "ACTIVO" | "INACTIVO" | "SUSPENDIDO"

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: RoleType
  permissions: string[]
  department?: string
  avatarUrl?: string
  status: UserStatus
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  checkPermission: (permission: string) => boolean
  hasRole: (roles: RoleType | RoleType[]) => boolean
  refreshSession: () => Promise<void>
  sessionExpiresAt: number | null
  extendSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Fallback de permisos SOLO cuando el backend no envía permissions o viene vacío.
 */
const ROLE_PERMISSION_FALLBACK: Partial<Record<RoleType, string[]>> = {
  OFICIAL_CUMPLIMIENTO: ["screening:execute", "screening:read"],
  AUDITOR_INTERNO: ["screening:read"],
  REGULADOR_SUDEASEG: ["screening:read"],
}

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const WARNING_THRESHOLD = 2 * 60 * 1000 // 2 minutes before expiration (se deja como estaba)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetSessionTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId)

      if (user) {
        const expiresAt = Date.now() + SESSION_TIMEOUT
        setSessionExpiresAt(expiresAt)

        timeoutId = setTimeout(() => {
          console.log("[v0] Session expired due to inactivity")
          logout()
        }, SESSION_TIMEOUT)
      }
    }

    const handleActivity = () => {
      resetSessionTimeout()
    }

    if (user) {
      resetSessionTimeout()
      window.addEventListener("mousedown", handleActivity)
      window.addEventListener("keydown", handleActivity)
      window.addEventListener("touchstart", handleActivity)
      window.addEventListener("scroll", handleActivity)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener("mousedown", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("touchstart", handleActivity)
      window.removeEventListener("scroll", handleActivity)
    }
    // Nota: se deja igual que tu original para no tocar comportamiento.
  }, [user])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("sagra_token")
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]))
          const expiresAt = payload.exp * 1000

          if (Date.now() >= expiresAt) {
            localStorage.removeItem("sagra_token")
            setIsLoading(false)
            return
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

          if (response.ok) {
            const data = await response.json()
            setUser(data.data)
            console.log("[v0] Session restored for user:", data.data.username)
          } else {
            localStorage.removeItem("sagra_token")
          }
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        localStorage.removeItem("sagra_token")
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          },
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Error de autenticación")
        }

        const data = await response.json()

        if (data.data.user.status === "INACTIVO") {
          throw new Error("Usuario inactivo. Contacte al administrador.")
        }

        if (data.data.user.status === "SUSPENDIDO") {
          throw new Error("Usuario suspendido. Contacte al departamento de cumplimiento.")
        }

        localStorage.setItem("sagra_token", data.data.token)
        setUser(data.data.user)
        console.log("[v0] User logged in successfully:", credentials.username)
        router.push("/dashboard")
      } catch (error) {
        console.error("[v0] Login error:", error)
        throw error
      }
    },
    [router],
  )

  const logout = useCallback(() => {
    localStorage.removeItem("sagra_token")
    sessionStorage.clear()
    setUser(null)
    setSessionExpiresAt(null)
    router.push("/login")
  }, [router])

  const refreshSession = useCallback(async () => {
    try {
      const token = localStorage.getItem("sagra_token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
      } else {
        logout()
      }
    } catch (error) {
      console.error("[v0] Session refresh error:", error)
      logout()
    }
  }, [logout])

  const extendSession = useCallback(() => {
    if (user) {
      const expiresAt = Date.now() + SESSION_TIMEOUT
      setSessionExpiresAt(expiresAt)
    }
  }, [user])

  // ✅ Cambio mínimo: fallback por rol si permissions viene vacío
  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false

      if (Array.isArray(user.permissions) && user.permissions.length > 0) {
        return user.permissions.includes(permission)
      }

      const fallback = ROLE_PERMISSION_FALLBACK[user.role] || []
      return fallback.includes(permission)
    },
    [user],
  )

  const hasRole = useCallback(
    (roles: RoleType | RoleType[]): boolean => {
      if (!user) return false
      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(user.role)
    },
    [user],
  )

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkPermission,
    hasRole,
    refreshSession,
    sessionExpiresAt,
    extendSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
