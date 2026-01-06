import type React from "react"
import { AuthProvider } from "@/lib/auth/auth-context"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
