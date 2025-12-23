"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Shield,
  FileCheck,
  Activity,
} from "lucide-react"

interface DataQualityMetrics {
  completenessRate: number
  accuracyRate: number
  timeliness: {
    documentsUpToDate: number
    evaluationsUpToDate: number
    screeningsUpToDate: number
  }
  consistency: {
    duplicatesDetected: number
    inconsistenciesFound: number
  }
  trends: {
    completenessChange: number
    accuracyChange: number
  }
}

export default function DataGovernanceDashboard() {
  const [metrics, setMetrics] = useState<DataQualityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDataQualityMetrics()
  }, [])

  const fetchDataQualityMetrics = async () => {
    try {
      const response = await fetch("/api/governance/quality-metrics")
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("[v0] Error fetching quality metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando métricas de calidad...</p>
        </div>
      </div>
    )
  }

  const completenessStatus =
    (metrics?.completenessRate ?? 0) >= 95 ? "success" : (metrics?.completenessRate ?? 0) >= 90 ? "warning" : "error"

  const accuracyStatus =
    (metrics?.accuracyRate ?? 0) >= 95 ? "success" : (metrics?.accuracyRate ?? 0) >= 90 ? "warning" : "error"

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gobierno de Datos</h1>
          <p className="text-muted-foreground">Dashboard de Calidad de Datos del SAGIRC</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Database className="h-4 w-4 mr-2" />
          Actualizado en tiempo real
        </Badge>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completitud</CardTitle>
            {completenessStatus === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : completenessStatus === "warning" ? (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.completenessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {(metrics?.trends.completenessChange ?? 0) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />+{metrics?.trends.completenessChange.toFixed(1)}
                  % vs. mes anterior
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  {metrics?.trends.completenessChange.toFixed(1)}% vs. mes anterior
                </>
              )}
            </p>
            <Progress value={metrics?.completenessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exactitud</CardTitle>
            {accuracyStatus === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : accuracyStatus === "warning" ? (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.accuracyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {(metrics?.trends.accuracyChange ?? 0) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />+{metrics?.trends.accuracyChange.toFixed(1)}%
                  vs. mes anterior
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  {metrics?.trends.accuracyChange.toFixed(1)}% vs. mes anterior
                </>
              )}
            </p>
            <Progress value={metrics?.accuracyRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicados Detectados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.consistency.duplicatesDetected ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren revisión manual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inconsistencias</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.consistency.inconsistenciesFound ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Detectadas por motor de reglas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalles */}
      <Tabs defaultValue="timeliness" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeliness">
            <Clock className="h-4 w-4 mr-2" />
            Vigencia
          </TabsTrigger>
          <TabsTrigger value="controls">
            <Shield className="h-4 w-4 mr-2" />
            Controles
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <FileCheck className="h-4 w-4 mr-2" />
            Evidencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeliness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vigencia de Datos</CardTitle>
              <CardDescription>Estado de actualización de información crítica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Documentos Vigentes</span>
                  <span className="text-sm font-bold">{metrics?.timeliness.documentsUpToDate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics?.timeliness.documentsUpToDate} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Evaluaciones Actualizadas</span>
                  <span className="text-sm font-bold">{metrics?.timeliness.evaluationsUpToDate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics?.timeliness.evaluationsUpToDate} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Screening Ejecutado</span>
                  <span className="text-sm font-bold">{metrics?.timeliness.screeningsUpToDate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics?.timeliness.screeningsUpToDate} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controles de Calidad</CardTitle>
              <CardDescription>Resumen de controles preventivos, detectivos y correctivos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="rounded-lg bg-green-100 p-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">Controles Preventivos</h4>
                    <p className="text-sm text-muted-foreground">
                      Validaciones en tiempo real, campos obligatorios, formatos
                    </p>
                  </div>
                  <Badge variant="outline">Activo</Badge>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">Controles Detectivos</h4>
                    <p className="text-sm text-muted-foreground">
                      Motor de reglas diario, detección de duplicados, inconsistencias
                    </p>
                  </div>
                  <Badge variant="outline">Programado</Badge>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="rounded-lg bg-yellow-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">Controles Correctivos</h4>
                    <p className="text-sm text-muted-foreground">Workflow de corrección, aprobaciones, auditoría</p>
                  </div>
                  <Badge variant="outline">Activo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidencia de Cumplimiento</CardTitle>
              <CardDescription>Documentación para auditorías internas y reguladores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold">Auditoría Inmutable</h4>
                    <p className="text-xs text-muted-foreground">Registros completos con hash chain</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold">Historial de Cambios</h4>
                    <p className="text-xs text-muted-foreground">Versionamiento completo de expedientes</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold">Reportes de Calidad</h4>
                    <p className="text-xs text-muted-foreground">Métricas mensuales y tendencias</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
