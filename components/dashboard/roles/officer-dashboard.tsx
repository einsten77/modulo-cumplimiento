"use client"

import { MetricCard } from "../metric-card"
import { AlertList } from "../alert-list"
import { FileText, AlertTriangle, Shield, Search, CheckCircle, XCircle, Clock, Users } from "lucide-react"

// Mock data - will be replaced with API calls
const metrics = {
  totalDossiers: 1247,
  incompleteDossiers: 23,
  expiredDocuments: 8,
  activeAlerts: 12,
  highRiskDossiers: 34,
  pendingScreenings: 7,
  activePEP: 18,
  pendingApprovals: 15,
}

const recentAlerts = [
  {
    id: "1",
    title: "Documento Vencido - Registro Mercantil",
    description: "El documento de registro mercantil del cliente ha vencido y requiere actualización",
    severity: "HIGH" as const,
    createdAt: "Hace 2 horas",
    dossierType: "Cliente",
    dossierName: "Seguros del Valle C.A.",
  },
  {
    id: "2",
    title: "Coincidencia de Screening - Lista OFAC",
    description: "Posible coincidencia detectada en lista OFAC para nuevo intermediario",
    severity: "CRITICAL" as const,
    createdAt: "Hace 4 horas",
    dossierType: "Intermediario",
    dossierName: "Carlos Ramírez",
  },
  {
    id: "3",
    title: "Cambio de Riesgo - Medio a Alto",
    description: "La evaluación de riesgo cambió automáticamente por detección de PEP vinculado",
    severity: "HIGH" as const,
    createdAt: "Ayer",
    dossierType: "Cliente",
    dossierName: "Inversiones ABC S.A.",
  },
  {
    id: "4",
    title: "Documentación Incompleta",
    description: "Faltan 3 documentos obligatorios en expediente de proveedor",
    severity: "MEDIUM" as const,
    createdAt: "Hace 2 días",
    dossierType: "Proveedor",
    dossierName: "Tecnología y Servicios C.A.",
  },
]

export function OfficerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Panel del Oficial de Cumplimiento</h2>
        <p className="text-muted-foreground">Vista general del estado de cumplimiento y gestión de riesgos</p>
      </div>

      {/* Critical Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Alertas Críticas"
          value={metrics.activeAlerts}
          icon={AlertTriangle}
          variant="danger"
          description="Requieren atención inmediata"
          onClick={() => console.log("[v0] Navigate to alerts")}
        />
        <MetricCard
          title="Aprobaciones Pendientes"
          value={metrics.pendingApprovals}
          icon={Clock}
          variant="warning"
          description="Expedientes esperando revisión"
          onClick={() => console.log("[v0] Navigate to approvals")}
        />
        <MetricCard
          title="Riesgo Alto"
          value={metrics.highRiskDossiers}
          icon={Shield}
          variant="warning"
          description="Expedientes clasificados como alto riesgo"
          onClick={() => console.log("[v0] Navigate to high risk")}
        />
        <MetricCard
          title="Screenings Pendientes"
          value={metrics.pendingScreenings}
          icon={Search}
          description="Decisiones de screening requeridas"
          onClick={() => console.log("[v0] Navigate to screening")}
        />
      </div>

      {/* General Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Expedientes"
          value={metrics.totalDossiers}
          icon={FileText}
          description="Todos los tipos"
          onClick={() => console.log("[v0] Navigate to dossiers")}
        />
        <MetricCard
          title="Expedientes Incompletos"
          value={metrics.incompleteDossiers}
          icon={XCircle}
          variant={metrics.incompleteDossiers > 20 ? "warning" : "default"}
          description="Faltan documentos obligatorios"
          onClick={() => console.log("[v0] Navigate to incomplete")}
        />
        <MetricCard
          title="Documentos Vencidos"
          value={metrics.expiredDocuments}
          icon={Clock}
          variant={metrics.expiredDocuments > 5 ? "danger" : "default"}
          description="Requieren renovación urgente"
          onClick={() => console.log("[v0] Navigate to expired")}
        />
        <MetricCard
          title="PEP Activos"
          value={metrics.activePEP}
          icon={Users}
          description="Personas expuestas políticamente"
          onClick={() => console.log("[v0] Navigate to PEP")}
        />
      </div>

      {/* Alerts Section */}
      <AlertList alerts={recentAlerts} maxItems={4} />

      {/* Compliance Indicator */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Nivel de Cumplimiento Global"
          value="94.2%"
          icon={CheckCircle}
          variant="success"
          description="Indicador general de cumplimiento normativo"
          trend={{ value: 2.3, isPositive: true }}
        />
        <MetricCard
          title="Expedientes con Gestión Activa"
          value="98.1%"
          icon={Shield}
          variant="success"
          description="Expedientes con seguimiento y control activo"
          trend={{ value: 1.5, isPositive: true }}
        />
      </div>
    </div>
  )
}
