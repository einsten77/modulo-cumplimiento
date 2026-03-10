import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DossierDetailView } from "@/components/dossiers/dossier-detail-view"

export default function DossierDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <DashboardShell>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DossierDetailView dossierId={params.id} />
      </div>
    </DashboardShell>
  )
}
