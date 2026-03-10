"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
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

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const LS_TOKEN = "sagra_token"
const LS_USER = "sagra_user"

function base64UrlToUtf8(b64url: string): string {
  const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "===".slice((base64.length + 3) % 4)
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(padded), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  )
}

function tryGetTokenExpMs(token: string): number | null {
  const parts = token.split(".")
  if (parts.length < 2) return null
  try {
    const payloadJson = base64UrlToUtf8(parts[1])
    const payload = JSON.parse(payloadJson)
    if (typeof payload?.exp === "number") return payload.exp * 1000
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null)
  const router = useRouter()

  // Inactivity timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

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

    const handleActivity = () => resetSessionTimeout()

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
  }, [user])

  // Restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem(LS_TOKEN)
        if (!token) return

        const expMs = tryGetTokenExpMs(token)
        if (expMs && Date.now() >= expMs) {
          localStorage.removeItem(LS_TOKEN)
          localStorage.removeItem(LS_USER)
          return
        }

        // 1) Primero intenta restaurar el usuario guardado (modo dev sin backend)
        const storedUser = localStorage.getItem(LS_USER)
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as User
            setUser(parsed)
            console.log("[v0] Session restored from localStorage user:", parsed.username)
            return
          } catch {
            localStorage.removeItem(LS_USER)
          }
        }

        // 2) Si hay backend, intenta /me
        const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL
        if (!backendBase) return

        const response = await fetch(`${backendBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.data)
          localStorage.setItem(LS_USER, JSON.stringify(data.data))
          console.log("[v0] Session restored for user:", data.data.username)
        } else {
          localStorage.removeItem(LS_TOKEN)
          localStorage.removeItem(LS_USER)
        }
      } catch (error) {
        console.error("[v0] Auth initialization error:", error)
        localStorage.removeItem(LS_TOKEN)
        localStorage.removeItem(LS_USER)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || ""
      const url = backendBase ? `${backendBase}/api/auth/login` : `/api/auth/login`

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        let msg = "Error de autenticación"
        try {
          const error = await response.json()
          msg = error.message || msg
        } catch {}
        throw new Error(msg)
      }

      const data = await response.json()

      if (data?.data?.user?.status === "INACTIVO") {
        throw new Error("Usuario inactivo. Contacte al administrador.")
      }
      if (data?.data?.user?.status === "SUSPENDIDO") {
        throw new Error("Usuario suspendido. Contacte al departamento de cumplimiento.")
      }

      localStorage.setItem(LS_TOKEN, data.data.token)
      localStorage.setItem(LS_USER, JSON.stringify(data.data.user))
      setUser(data.data.user)

      console.log("[v0] User logged in successfully:", credentials.username)
      router.push("/dashboard")
    },
    [router],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_USER)
    sessionStorage.clear()
    setUser(null)
    setSessionExpiresAt(null)
    router.push("/login")
  }, [router])

  const refreshSession = useCallback(async () => {
    try {
      const token = localStorage.getItem(LS_TOKEN)
      if (!token) return

      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL
      if (!backendBase) return

      const response = await fetch(`${backendBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
        localStorage.setItem(LS_USER, JSON.stringify(data.data))
      } else {
        logout()
      }
    } catch (error) {
      console.error("[v0] Session refresh error:", error)
      logout()
    }
  }, [logout])

  const extendSession = useCallback(() => {
    if (user) setSessionExpiresAt(Date.now() + SESSION_TIMEOUT)
  }, [user])

  const checkPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false

      // Dev/admin: "*" = todo
      if (user.permissions?.includes("*")) return true

      // Compatibilidad con permisos legacy
      const legacyMap: Record<string, string[]> = {
        "screening:execute": ["EJECUTAR_SCREENING"],
        "screening:read": ["VER_RESULTADOS_SCREENING", "VER_SCREENING", "LEER_SCREENING"],
      }

      const legacy = legacyMap[permission] ?? []
      return user.permissions.includes(permission) || legacy.some((p) => user.permissions.includes(p))
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
