import { redirect } from "next/navigation"

export default function DashboardAlertsRedirect() {
  // elige a cuál quieres mandarlo
  redirect("/alertas")
}
