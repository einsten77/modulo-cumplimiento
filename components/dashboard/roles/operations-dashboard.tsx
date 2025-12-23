"use client"

import { MetricCard } from "../metric-card"
import { AlertList } from "../alert-list"
import { FileText, AlertTriangle, Clock, Upload, CheckCircle, XCircle } from "lucide-react"

const metrics = {
  underSupervision: 56,
  pendingObservations: 7,
  documentsToUpload: 4,
  completedTasks: 42,
  expiringSoon: 3,
}

const operationsAlerts = [
  {
    id: "1",
    title: "Observación Pendiente - Proveedor",
    description: "Cumplimiento ha solicitado aclaración sobre documento cargado",
    severity: "MEDIUM" as const,
    createdAt: "Hace 4 horas",
    dossierType: "Proveedor",
    dossierName: "Servicios Técnicos C.A.",
  },
  {
    id: "2",
    title: "Documento Faltante",
    description: "Faltan estados financieros del último trimestre",
    severity: "HIGH" as const,
    createdAt: "Ayer",
    dossierType: "Proveedor",
    dossierName: "Distribuidora XYZ",
  },
]

export function OperationsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Panel de Operaciones</h2>
        <p className="text-muted-foreground">Gestión operativa de expedientes bajo tu responsabilidad</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Expedientes Bajo Supervisión"
          value={metrics.underSupervision}
          icon={FileText}
          description="Total de expedientes asignados"
          onClick={() => console.log("[v0] Navigate to supervision")}
        />
        <MetricCard
          title="Observaciones Pendientes"
          value={metrics.pendingObservations}
          icon={AlertTriangle}
          variant="warning"
          description="Requieren respuesta o acción"
          onClick={() => console.log("[v0] Navigate to observations")}
        />
        <MetricCard
          title="Documentos por Cargar"
          value={metrics.documentsToUpload}
          icon={Upload}
          variant={metrics.documentsToUpload > 5 ? "warning" : "default"}
          description="Pendientes de carga"
          onClick={() => console.log("[v0] Navigate to upload")}
        />
        <MetricCard
          title="Tareas Completadas"
          value={metrics.completedTasks}
          icon={CheckCircle}
          variant="success"
          description="Este mes"
        />
        <MetricCard
          title="Documentos por Vencer"
          value={metrics.expiringSoon}
          icon={Clock}
          description="Próximos 30 días"
          onClick={() => console.log("[v0] Navigate to expiring")}
        />
        <MetricCard
          title="Expedientes Incompletos"
          value={metrics.pendingObservations + metrics.documentsToUpload}
          icon={XCircle}
          description="Requieren atención"
        />
      </div>

      <AlertList alerts={operationsAlerts} maxItems={5} />
    </div>
  )
}
