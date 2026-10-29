"use client"

import { AlertTriangle, CalendarClock, FileWarning, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const alertasMock = [
  {
    id: 1,
    expediente: "CLI-2024-001",
    documento: "RIF",
    tipo: "Vencimiento próximo",
    detalle: "El documento vence en 10 días.",
    nivel: "media",
  },
  {
    id: 2,
    expediente: "EMP-2024-014",
    documento: "Cédula de identidad",
    tipo: "Documento vencido",
    detalle: "El documento ya se encuentra vencido.",
    nivel: "alta",
  },
  {
    id: 3,
    expediente: "PRO-2024-008",
    documento: "Registro mercantil",
    tipo: "Pendiente de aprobación",
    detalle: "Documento cargado y aún no revisado por Cumplimiento.",
    nivel: "baja",
  },
]

function getBadge(nivel: string) {
  if (nivel === "alta") return <Badge variant="destructive">Alta</Badge>
  if (nivel === "media") return <Badge variant="secondary">Media</Badge>
  return <Badge variant="outline">Baja</Badge>
}

function getIcon(tipo: string) {
  if (tipo === "Documento vencido") return <FileWarning className="h-4 w-4" />
  if (tipo === "Vencimiento próximo") return <CalendarClock className="h-4 w-4" />
  return <ShieldAlert className="h-4 w-4" />
}

export default function AlertasDocumentalesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Alertas de Documentos</h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento de vencimientos, pendientes de aprobación e incidencias documentales.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Documentos vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Próximos a vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pendientes de aprobación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de alertas</CardTitle>
          <CardDescription>Vista operativa para control documental</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alertasMock.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  {getIcon(alerta.tipo)}
                  <span>{alerta.tipo}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Expediente: {alerta.expediente}
                </p>
                <p className="text-sm text-muted-foreground">
                  Documento: {alerta.documento}
                </p>
                <p className="text-sm">{alerta.detalle}</p>
              </div>
              <div>{getBadge(alerta.nivel)}</div>
            </div>
          ))}

          {alertasMock.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No hay alertas documentales registradas.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
