import type React from "react"
import { SidebarNav } from "./sidebar-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
