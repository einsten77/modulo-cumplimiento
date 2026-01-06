import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DossierListView } from "@/components/dossiers/dossier-list-view"

/**
 * Alias de ruta.
 *
 * En el UI existen enlaces hacia /expedientes, mientras que la implementación
 * original del listado vive en /dossiers.
 *
 * Para no tocar la estructura existente ni los componentes, exponemos esta
 * ruta como un wrapper que reutiliza exactamente la misma vista.
 */
export default function ExpedientesPage() {
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
