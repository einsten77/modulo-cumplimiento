import { redirect } from "next/navigation"

export default function Page() {
  // Redirige al submódulo principal existente de "Casos y Alertas"
  // (ajusta aquí si tu ruta real es otra)
  redirect("/casos/alertas")
}
