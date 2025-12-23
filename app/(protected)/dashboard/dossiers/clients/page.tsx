import { DossierListView } from "@/components/dossiers/dossier-list-view"

export default function DashboardDossiersClientsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DossierListView initialSubjectType="CLIENT" />
    </div>
  )
}
