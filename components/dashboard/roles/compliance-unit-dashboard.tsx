"use client"

import { MetricCard } from "../metric-card"
import { AlertList } from "../alert-list"
import { FileText, AlertTriangle, Shield, Clock, FileCheck, TrendingUp } from "lucide-react"

const metrics = {
  assignedDossiers: 87,
  pendingReviews: 12,
  openFollowups: 23,
  ongoingEvaluations: 8,
  completedThisWeek: 34,
  averageProcessingTime: "3.2 días",
}

const assignedAlerts = [
  {
    id: "1",
    title: "Revisión de Documentación - Cliente Nuevo",
    description: "Documentos recibidos para nuevo cliente corporativo, requiere verificación",
    severity: "MEDIUM" as const,
    createdAt: "Hace 1 hora",
    dossierType: "Cliente",
    dossierName: "Corporación XYZ C.A.",
  },
  {
    id: "2",
    title: "Seguimiento PEP - Actualización Requerida",
    description: "Cliente identificado como PEP vinculado, requiere actualización de DD",
    severity: "HIGH" as const,
    createdAt: "Hace 3 horas",
    dossierType: "Cliente",
    dossierName: "Juan Pérez",
  },
  {
    id: "3",
    title: "Evaluación de Riesgo Pendiente",
    description: "Nuevo intermediario requiere evaluación inicial de riesgo",
    severity: "MEDIUM" as const,
    createdAt: "Ayer",
    dossierType: "Intermediario",
    dossierName: "Ana Martínez",
  },
]

export function ComplianceUnitDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Panel de Unidad de Cumplimiento</h2>
        <p className="text-muted-foreground">Gestión operativa de expedientes y evaluaciones asignadas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Expedientes Asignados"
          value={metrics.assignedDossiers}
          icon={FileText}
          description="Total bajo tu responsabilidad"
          onClick={() => console.log("[v0] Navigate to assigned")}
        />
        <MetricCard
          title="Pendientes de Revisión"
          value={metrics.pendingReviews}
          icon={Clock}
          variant="warning"
          description="Documentos esperando validación"
          onClick={() => console.log("[v0] Navigate to pending")}
        />
        <MetricCard
          title="Seguimientos Abiertos"
          value={metrics.openFollowups}
          icon={AlertTriangle}
          description="Casos activos en investigación"
          onClick={() => console.log("[v0] Navigate to followups")}
        />
        <MetricCard
          title="Evaluaciones en Curso"
          value={metrics.ongoingEvaluations}
          icon={Shield}
          description="Evaluaciones de riesgo activas"
          onClick={() => console.log("[v0] Navigate to evaluations")}
        />
        <MetricCard
          title="Completados Esta Semana"
          value={metrics.completedThisWeek}
          icon={FileCheck}
          variant="success"
          description="Expedientes finalizados"
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Tiempo Promedio"
          value={metrics.averageProcessingTime}
          icon={TrendingUp}
          description="Tiempo de procesamiento"
        />
      </div>

      <AlertList alerts={assignedAlerts} maxItems={5} />
    </div>
  )
}
