"use client"

import type React from "react"

import { useAuth, type RoleType } from "@/lib/auth/auth-context"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: RoleType[]
  requiredPermission?: string
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, requiredPermission, fallback = null }: RoleGuardProps) {
  const { isAuthenticated, hasRole, checkPermission } = useAuth()

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <>{fallback}</>
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
