import { DossierListView } from "@/components/dossiers/dossier-list-view"

/**
 * Ruta del submenú "Proveedores":
 * /dashboard/dossiers/suppliers
 *
 * El layout de /dashboard ya contiene el shell y el header,
 * aquí solo se renderiza el contenido.
 */
export default function DashboardDossiersSuppliersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DossierListView initialSubjectType="PROVIDER" />
    </div>
  )
}
