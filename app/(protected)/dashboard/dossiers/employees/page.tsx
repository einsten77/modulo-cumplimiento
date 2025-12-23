import { DossierListView } from "@/components/dossiers/dossier-list-view"

/**
 * Ruta del submenú "Empleados":
 * /dashboard/dossiers/employees
 *
 * El layout de /dashboard ya contiene el shell y el header.
 * Aquí solo se renderiza el contenido.
 */
export default function DashboardDossiersEmployeesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DossierListView initialSubjectType="EMPLOYEE" />
    </div>
  )
}
