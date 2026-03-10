"use client"

import { MetricCard } from "../metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Shield, FileText, AlertTriangle, Users, Search, TrendingUp, CheckCircle, Activity } from "lucide-react"

const globalMetrics = {
  totalDossiers: 1247,
  complianceScore: 94.2,
  activeAlerts: 12,
  highRiskDossiers: 34,
  mediumRiskDossiers: 187,
  lowRiskDossiers: 1026,
  activePEP: 18,
  pendingScreenings: 7,
  expiredDocuments: 8,
  completedThisMonth: 456,
}

const complianceByArea = [
  { area: "Debida Diligencia", score: 96.5, color: "bg-success" },
  { area: "Screening", score: 98.1, color: "bg-success" },
  { area: "Gestión PEP", score: 92.3, color: "bg-success" },
  { area: "Gestión Documental", score: 89.7, color: "bg-warning" },
  { area: "Alertas y Casos", score: 94.8, color: "bg-success" },
]

export function AuditorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Vista Consolidada - Auditoría / Contraloría / SUDEASEG
        </h2>
        <p className="text-muted-foreground">Indicadores globales del sistema de cumplimiento (Solo Lectura)</p>
      </div>

      {/* Global Compliance Score */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Nivel de Cumplimiento Global"
          value={`${globalMetrics.complianceScore}%`}
          icon={Shield}
          variant="success"
          description="Indicador consolidado de cumplimiento"
          trend={{ value: 2.3, isPositive: true }}
        />
        <MetricCard
          title="Total de Expedientes"
          value={globalMetrics.totalDossiers}
          icon={FileText}
          description="Todos los tipos registrados"
        />
        <MetricCard
          title="Alertas Activas"
          value={globalMetrics.activeAlerts}
          icon={AlertTriangle}
          variant={globalMetrics.activeAlerts > 15 ? "warning" : "default"}
          description="En gestión por Cumplimiento"
        />
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Distribución de Riesgo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Riesgo Alto"
              value={globalMetrics.highRiskDossiers}
              icon={AlertTriangle}
              variant="danger"
              description={`${((globalMetrics.highRiskDossiers / globalMetrics.totalDossiers) * 100).toFixed(1)}% del total`}
            />
            <MetricCard
              title="Riesgo Medio"
              value={globalMetrics.mediumRiskDossiers}
              icon={AlertTriangle}
              variant="warning"
              description={`${((globalMetrics.mediumRiskDossiers / globalMetrics.totalDossiers) * 100).toFixed(1)}% del total`}
            />
            <MetricCard
              title="Riesgo Bajo"
              value={globalMetrics.lowRiskDossiers}
              icon={CheckCircle}
              variant="success"
              description={`${((globalMetrics.lowRiskDossiers / globalMetrics.totalDossiers) * 100).toFixed(1)}% del total`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance by Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Cumplimiento por Área
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {complianceByArea.map((item) => (
            <div key={item.area} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.area}</span>
                <span className="text-muted-foreground">{item.score}%</span>
              </div>
              <Progress value={item.score} className={`h-2 ${item.color}`} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="PEP Activos"
          value={globalMetrics.activePEP}
          icon={Users}
          description="Personas expuestas políticamente"
        />
        <MetricCard
          title="Screenings Pendientes"
          value={globalMetrics.pendingScreenings}
          icon={Search}
          description="Decisiones requeridas"
        />
        <MetricCard
          title="Documentos Vencidos"
          value={globalMetrics.expiredDocuments}
          icon={AlertTriangle}
          variant={globalMetrics.expiredDocuments > 10 ? "danger" : "warning"}
          description="Requieren renovación"
        />
        <MetricCard
          title="Procesados Este Mes"
          value={globalMetrics.completedThisMonth}
          icon={CheckCircle}
          variant="success"
          description="Expedientes gestionados"
        />
      </div>
    </div>
  )
}
