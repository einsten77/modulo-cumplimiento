"use client"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { OfficerDashboard } from "@/components/dashboard/roles/officer-dashboard"
import { ComplianceUnitDashboard } from "@/components/dashboard/roles/compliance-unit-dashboard"
import { CommercialDashboard } from "@/components/dashboard/roles/commercial-dashboard"
import { OperationsDashboard } from "@/components/dashboard/roles/operations-dashboard"
import { AuditorDashboard } from "@/components/dashboard/roles/auditor-dashboard"

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "OFICIAL_CUMPLIMIENTO":
        return <OfficerDashboard />
      case "CONSULTOR":
        return <ComplianceUnitDashboard />
      case "USUARIO_COMERCIAL":
        return <CommercialDashboard />
      case "USUARIO_RRHH":
      case "AUDITOR_INTERNO":
      case "REGULADOR_SUDEASEG":
        // RRHH, Operaciones, Administración, Técnico tienen vistas similares
        // Auditores y reguladores tienen vista consolidada
        return user.role === "AUDITOR_INTERNO" || user.role === "REGULADOR_SUDEASEG" ? (
          <AuditorDashboard />
        ) : (
          <OperationsDashboard />
        )
      default:
        return <OfficerDashboard />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 ml-64 p-8">{renderDashboard()}</main>
      </div>

      <Footer />
    </div>
  )
}
