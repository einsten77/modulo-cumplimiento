import type { ReactNode } from "react"
import { Sidebar } from "../../../components/dashboard/sidebar"
import { DashboardHeader } from "../../../components/dashboard/dashboard-header"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
