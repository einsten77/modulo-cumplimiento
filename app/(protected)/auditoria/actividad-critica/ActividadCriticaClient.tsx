"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertTriangle,
  Shield,
  Search,
  Download,
  Eye,
  Clock,
  User,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function ActividadCriticaClient() {
  const { user, hasRole } = useAuth()
  const [selectedDossier, setSelectedDossier] = useState<string>("EXP-2024-045")

  // Read-only for auditors and inspectors
  const isReadOnly = hasRole(["AUDITOR_INTERNO", "AUDITOR_EXTERNO", "REGULADOR_SUDEASEG"])

  const timeline = {
    dossierId: "d8f9a7b6-c5e4-4321-9876-543210fedcba",
    dossierCode: "EXP-2024-045",
    clientName: "Roberto Gutiérrez Silva",
    activities: [
      {
        id: "ACT-001",
        activityType: "SCREENING_MATCH",
        severity: "CRITICAL",
        timestamp: "2024-12-15 14:32:15",
        userId: "u123",
        userName: "María González",
        userRole: "Oficial de Cumplimiento",
        module: "Screening",
        actionDescription: "Decisión de Cumplimiento - Descarte de Coincidencia",
        previousState: "Pendiente Revisión",
        newState: "Descartado - Falso Positivo",
        justification:
          "Tras revisión exhaustiva se determina que la coincidencia en lista OFAC corresponde a homonimia. Nacionalidad y fecha de nacimiento no coinciden con el registro en la lista restrictiva.",
        evidenceFiles: ["screening-decision-045.pdf", "comparison-matrix-045.xlsx"],
        ipAddress: "192.168.1.45",
        metadata: {
          listName: "OFAC SDN",
          matchScore: 0.87,
          reviewDuration: "45 minutos",
        },
      },
      {
        id: "ACT-002",
        activityType: "RISK_CHANGE",
        severity: "HIGH",
        timestamp: "2024-12-15 11:20:33",
        userId: "u124",
        userName: "Carlos Ramírez",
        userRole: "Analista de Riesgos",
        module: "Evaluación de Riesgos",
        actionDescription: "Cambio de Clasificación de Riesgo - Medio a Alto",
        previousState: "Riesgo Medio",
        newState: "Riesgo Alto",
        justification:
          "Se detectaron transacciones atípicas superiores a USD 50,000 en los últimos 30 días. Cliente declaró ingresos mensuales de Bs. 5,000. Discrepancia significativa que justifica re-clasificación.",
        evidenceFiles: ["risk-analysis-045.pdf", "transaction-report-045.xlsx"],
        ipAddress: "192.168.1.52",
        metadata: {
          previousScore: 45,
          newScore: 72,
          triggerFactor: "Transacciones Atípicas",
        },
      },
      {
        id: "ACT-003",
        activityType: "PEP_DECISION",
        severity: "CRITICAL",
        timestamp: "2024-12-14 16:45:22",
        userId: "u123",
        userName: "María González",
        userRole: "Oficial de Cumplimiento",
        module: "PEP",
        actionDescription: "Declaración de PEP Vinculado",
        previousState: "No PEP",
        newState: "PEP Vinculado",
        justification:
          "Se identificó relación familiar directa con funcionario público de alto nivel. Cónyuge del cliente es Director General del Ministerio de Finanzas según verificación en Gaceta Oficial Nº 42.578.",
        evidenceFiles: ["pep-declaration-045.pdf", "official-gazette-excerpt.pdf", "family-tree-045.pdf"],
        ipAddress: "192.168.1.45",
        metadata: {
          relationshipType: "Cónyuge",
          pepPosition: "Director General - Ministerio de Finanzas",
          verificationSource: "Gaceta Oficial",
        },
      },
      {
        id: "ACT-004",
        activityType: "DOCUMENT_APPROVAL",
        severity: "MEDIUM",
        timestamp: "2024-12-14 10:15:44",
        userId: "u125",
        userName: "Ana Martínez",
        userRole: "Unidad de Cumplimiento",
        module: "Documentos",
        actionDescription: "Aprobación de Due Diligence Reforzada",
        previousState: "Pendiente Revisión",
        newState: "Aprobado",
        justification:
          "Documentación completa y válida. RIF actualizado, estados financieros auditados y declaración de origen de fondos firmada y notariada.",
        evidenceFiles: ["due-diligence-package-045.pdf", "approval-checklist-045.pdf"],
        ipAddress: "192.168.1.78",
        metadata: {
          documentCount: 12,
          reviewDuration: "2 horas",
        },
      },
    ],
  }

  const getSeverityBadge = (severity: string) => {
    const configs = {
      CRITICAL: { color: "bg-destructive text-white", label: "Crítico" },
      HIGH: { color: "bg-warning text-white", label: "Alto" },
      MEDIUM: { color: "bg-info text-white", label: "Medio" },
    }
    const config = configs[severity as keyof typeof configs]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      SCREENING_MATCH: Shield,
      RISK_CHANGE: AlertTriangle,
      PEP_DECISION: User,
      DOCUMENT_APPROVAL: FileText,
      ALERT_CLOSURE: CheckCircle2,
      CASE_DECISION: XCircle,
    }
    const Icon = icons[type as keyof typeof icons] || Shield
    return <Icon className="h-5 w-5" />
  }

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      SCREENING_MATCH: "Screening - Coincidencia",
      RISK_CHANGE: "Cambio de Riesgo",
      PEP_DECISION: "Decisión PEP",
      DOCUMENT_APPROVAL: "Aprobación Documento",
      ALERT_CLOSURE: "Cierre de Alerta",
      CASE_DECISION: "Decisión de Caso",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#00bf63]" />
            Registro de Actividad Crítica
          </h1>
          <p className="text-muted-foreground mt-1">
            Evidencia regulatoria de acciones críticas - Trazabilidad completa para SUDEASEG
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar Evidencia
          </Button>
        </div>
      </div>

      {isReadOnly && (
        <Card className="border-info bg-info/5">
          <CardContent className="pt-6">
            <p className="text-sm text-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-info" />
              <strong>Modo Solo Lectura:</strong> Como{" "}
              {user?.role === "REGULADOR_SUDEASEG" ? "Inspector SUDEASEG" : "Auditor"}, tiene acceso de solo lectura a
              todos los registros de actividad crítica.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda de Expediente</CardTitle>
          <CardDescription>
            Ingrese el código del expediente para visualizar su línea de tiempo de actividades críticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="EXP-2024-XXX"
              value={selectedDossier}
              onChange={(e) => setSelectedDossier(e.target.value)}
            />
            <Button className="gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#00bf63]/20">
        <CardHeader className="bg-[#00bf63]/5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Línea de Tiempo - {timeline.dossierCode}</CardTitle>
              <CardDescription className="mt-1">
                Cliente: <strong>{timeline.clientName}</strong> • {timeline.activities.length} actividades críticas
                registradas
              </CardDescription>
            </div>
            <Badge className="bg-[#00bf63] text-white text-base px-4 py-2">Expediente Activo</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {timeline.activities.map((activity) => (
                <div key={activity.id} className="relative pl-14">
                  <div className="absolute left-3 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#00bf63] text-white ring-4 ring-background">
                    {getActivityIcon(activity.activityType)}
                  </div>

                  <Card className="border-l-4 border-l-[#00bf63]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityBadge(activity.severity)}
                            <Badge variant="outline" className="border-[#00bf63] text-[#00bf63]">
                              {activity.module}
                            </Badge>
                            <span className="text-xs text-muted-foreground">ID: {activity.id}</span>
                          </div>
                          <CardTitle className="text-base">{getActivityTypeLabel(activity.activityType)}</CardTitle>
                          <CardDescription className="mt-1">{activity.actionDescription}</CardDescription>
                        </div>
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            {activity.timestamp}
                          </div>
                          <div className="text-xs text-muted-foreground">IP: {activity.ipAddress}</div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{activity.userName}</span>
                            <span className="text-muted-foreground">({activity.userRole})</span>
                          </div>

                          {activity.previousState && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Estado anterior:</span>{" "}
                              <Badge variant="outline">{activity.previousState}</Badge>
                            </div>
                          )}

                          <div className="text-sm">
                            <span className="text-muted-foreground">Estado nuevo:</span>{" "}
                            <Badge className="bg-[#00bf63] text-white">{activity.newState}</Badge>
                          </div>
                        </div>

                        {Object.keys(activity.metadata).length > 0 && (
                          <div className="rounded-lg border border-border bg-muted/30 p-3">
                            <p className="text-xs font-medium text-foreground mb-2">Metadatos:</p>
                            <dl className="space-y-1 text-xs">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <dt className="text-muted-foreground">{key}:</dt>
                                  <dd className="font-medium text-foreground">{String(value)}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Justificación:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{activity.justification}</p>
                      </div>

                      {activity.evidenceFiles.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#00bf63]" />
                              Evidencia Adjunta ({activity.evidenceFiles.length})
                            </p>
                            <div className="grid gap-2 md:grid-cols-2">
                              {activity.evidenceFiles.map((file, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="justify-start gap-2 text-xs bg-transparent"
                                  disabled={isReadOnly}
                                >
                                  <FileText className="h-3 w-3" />
                                  {file}
                                  <Eye className="h-3 w-3 ml-auto" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#fce809]">
        <CardHeader className="bg-[#fce809]/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#7f8083]" />
            Características del Registro de Actividad Crítica
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Evidencia Regulatoria:</strong> Todas las acciones críticas incluyen justificación obligatoria y
                evidencia documental adjunta.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Trazabilidad IP:</strong> Cada evento registra la dirección IP desde la cual se ejecutó la
                acción.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Inmutabilidad:</strong> Los registros no pueden ser editados ni eliminados, garantizando
                integridad para inspecciones SUDEASEG.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Línea de Tiempo:</strong> Visualización cronológica que permite reconstruir la secuencia
                completa de decisiones críticas por expediente.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
