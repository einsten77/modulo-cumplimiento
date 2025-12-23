import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DossierDetailView } from "@/components/dossiers/dossier-detail-view"

/**
 * Alias de ruta.
 *
 * El UI navega a /expedientes/:id para ver el detalle. La implementación
 * original del detalle está en /dossiers/:id.
 */
export default function ExpedienteDetailPage({
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
