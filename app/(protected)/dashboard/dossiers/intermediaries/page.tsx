import { DossierListView } from "@/components/dossiers/dossier-list-view"

/**
 * Ruta del submenú "Intermediarios":
 * /dashboard/dossiers/intermediaries
 *
 * Importante: el layout de /dashboard ya renderiza el shell/header.
 * Aquí solo renderizamos el contenido para evitar duplicar el menú.
 */
export default function DashboardDossiersIntermediariesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DossierListView initialSubjectType="INTERMEDIARY" />
    </div>
  )
}
