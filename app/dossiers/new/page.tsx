import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CreateDossierForm } from "@/components/dossiers/create-dossier-form"

export default function NewDossierPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Crear Nuevo Expediente"
        text="Complete la información requerida según el tipo de expediente"
      />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CreateDossierForm />
      </div>
    </DashboardShell>
  )
}
