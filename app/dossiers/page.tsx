import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DossierListView } from "@/components/dossiers/dossier-list-view"

export default function DossiersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Gestión de Expedientes"
        text="Centralización y control de expedientes de clientes, intermediarios, empleados, proveedores, reaseguradores y retrocesionarios"
      />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DossierListView />
      </div>
    </DashboardShell>
  )
}
