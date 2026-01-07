import { redirect } from "next/navigation"

export default function DashboardDueDiligenceRedirect() {
  // Si tu Debida Diligencia vive en Documentos, manda allí.
  // Ajustamos luego cuando exista su módulo propio.
  redirect("/documentos")
}
