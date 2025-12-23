import { redirect } from "next/navigation"

/**
 * En algunas vistas (ej. /casos/detalle) existe un enlace estático a
 * /expedientes/detalle sin un id. Para evitar 404 y sin alterar la
 * navegación existente, redirigimos al listado de expedientes.
 */
export default function ExpedientesDetalleRedirect() {
  redirect("/expedientes")
}
