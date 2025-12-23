import { DossierListView } from "@/components/dossiers/dossier-list-view"

/**
 * Ruta del submenú "Reaseguradores":
 * /dashboard/dossiers/reinsurers
 *
 * Nota: el layout de /dashboard ya renderiza el shell/header.
 * Aquí solo renderizamos el contenido para evitar duplicar el menú.
 */
export default function DashboardDossiersReinsurersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DossierListView initialSubjectType="REINSURER" />
    </div>
  )
}
