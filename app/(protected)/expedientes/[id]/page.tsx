import { DossierDetailView } from "@/components/dossiers/dossier-detail-view"

export default function ExpedienteDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="flex-1 space-y-4 p-6">
      <DossierDetailView dossierId={params.id} />
    </div>
  )
}
