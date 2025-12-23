import type React from "react"
import { AuthProvider } from "@/lib/auth/auth-context"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { SessionManager } from "@/components/auth/session-manager"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SessionManager />
      <div className="relative min-h-screen">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="ml-64 flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
