"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type RoleType } from "@/lib/auth/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: RoleType[]
  requiredPermission?: string
}

export function ProtectedRoute({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, checkPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (allowedRoles && !hasRole(allowedRoles)) {
        router.push("/dashboard")
        return
      }

      if (requiredPermission && !checkPermission(requiredPermission)) {
        router.push("/dashboard")
        return
      }
    }
  }, [isAuthenticated, isLoading, allowedRoles, requiredPermission, hasRole, checkPermission, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return null
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return null
  }

  return <>{children}</>
}
