import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DossierDetailComplete } from "@/components/dossiers/dossier-detail-complete"

export default function DossierDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <DashboardHeader userName="Usuario" userRole="Rol" />
      <div className="p-6">
        <DossierDetailComplete dossierId={params.id} />
      </div>
    </DashboardShell>
  )
}
