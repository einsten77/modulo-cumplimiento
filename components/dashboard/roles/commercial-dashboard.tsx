"use client"

import { MetricCard } from "../metric-card"
import { AlertList } from "../alert-list"
import { FileText, Users, AlertTriangle, Clock, CheckCircle } from "lucide-react"

const metrics = {
  clientsCreated: 145,
  intermediariesCreated: 67,
  incompleteClients: 8,
  incompleteIntermediaries: 5,
  pendingDocuments: 13,
  approvedThisMonth: 89,
}

const commercialAlerts = [
  {
    id: "1",
    title: "Documentación Incompleta - Cliente",
    description: "Faltan 2 documentos obligatorios para completar expediente",
    severity: "MEDIUM" as const,
    createdAt: "Hace 2 horas",
    dossierType: "Cliente",
    dossierName: "Empresa ABC S.A.",
  },
  {
    id: "2",
    title: "Documento Próximo a Vencer",
    description: "RIF de intermediario vence en 15 días",
    severity: "LOW" as const,
    createdAt: "Ayer",
    dossierType: "Intermediario",
    dossierName: "Pedro González",
  },
]

export function CommercialDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Panel del Área Comercial</h2>
        <p className="text-muted-foreground">Gestión de clientes e intermediarios comerciales</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Clientes Creados"
          value={metrics.clientsCreated}
          icon={Users}
          description="Total de clientes registrados"
          onClick={() => console.log("[v0] Navigate to clients")}
        />
        <MetricCard
          title="Intermediarios Creados"
          value={metrics.intermediariesCreated}
          icon={Users}
          description="Total de intermediarios registrados"
          onClick={() => console.log("[v0] Navigate to intermediaries")}
        />
        <MetricCard
          title="Aprobados Este Mes"
          value={metrics.approvedThisMonth}
          icon={CheckCircle}
          variant="success"
          description="Expedientes aprobados"
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Clientes Incompletos"
          value={metrics.incompleteClients}
          icon={Clock}
          variant={metrics.incompleteClients > 10 ? "warning" : "default"}
          description="Requieren documentación"
          onClick={() => console.log("[v0] Navigate to incomplete clients")}
        />
        <MetricCard
          title="Intermediarios Incompletos"
          value={metrics.incompleteIntermediaries}
          icon={AlertTriangle}
          variant={metrics.incompleteIntermediaries > 10 ? "warning" : "default"}
          description="Requieren documentación"
          onClick={() => console.log("[v0] Navigate to incomplete intermediaries")}
        />
        <MetricCard
          title="Documentos Pendientes"
          value={metrics.pendingDocuments}
          icon={FileText}
          description="Total de documentos por cargar"
        />
      </div>

      <AlertList alerts={commercialAlerts} maxItems={5} />
    </div>
  )
}
