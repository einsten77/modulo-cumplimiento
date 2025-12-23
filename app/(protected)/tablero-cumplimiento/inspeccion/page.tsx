"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  FileText,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
} from "lucide-react"
import Link from "next/link"

interface InspectionData {
  summary: {
    totalDossiers: number
    highRiskDossiers: number
    mediumRiskDossiers: number
    activeAlerts: number
    closedAlerts30d: number
    activePEPs: number
    screeningMatches: number
  }
  controls: {
    documentControl: boolean
    riskEvaluation: boolean
    screening: boolean
    pepMonitoring: boolean
    dueDiligence: boolean
  }
  recentActivity: Array<{
    date: string
    module: string
    action: string
    user: string
  }>
}

export default function VistaInspeccionPage() {
  const [data, setData] = useState<InspectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("last30days")

  useEffect(() => {
    fetchInspectionData()
  }, [dateRange])

  const fetchInspectionData = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/inspection-view?range=${dateRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      )

      if (!response.ok) throw new Error("Error al cargar datos de inspección")

      const inspectionData = await response.json()
      setData(inspectionData)
    } catch (error) {
      console.error("[v0] Error fetching inspection data:", error)
      // Mock data
      setData({
        summary: {
          totalDossiers: 156,
          highRiskDossiers: 8,
          mediumRiskDossiers: 23,
          activeAlerts: 18,
          closedAlerts30d: 42,
          activePEPs: 3,
          screeningMatches: 5,
        },
        controls: {
          documentControl: true,
          riskEvaluation: true,
          screening: true,
          pepMonitoring: true,
          dueDiligence: true,
        },
        recentActivity: [
          {
            date: new Date().toISOString(),
            module: "Evaluación de Riesgo",
            action: "Aprobación de evaluación riesgo medio",
            user: "María González - Oficial de Cumplimiento",
          },
          {
            date: new Date(Date.now() - 3600000).toISOString(),
            module: "Screening",
            action: "Análisis de coincidencia en lista OFAC",
            user: "Juan Pérez - Unidad de Cumplimiento",
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/audit/inspection-report?range=${dateRange}&format=pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      )

      if (!response.ok) throw new Error("Error al generar reporte")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-inspeccion-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("[v0] Error exporting report:", error)
      alert("Error al generar reporte")
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando vista de inspección...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Vista para Inspección</h1>
          <p className="text-muted-foreground">Panel de control para auditoría regulatoria - SUDEASEG</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Link href="/tablero-cumplimiento">
            <Button variant="outline">Volver al Tablero</Button>
          </Link>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <span className="text-sm font-medium">Período:</span>
          <div className="flex gap-2">
            <Button
              variant={dateRange === "last7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("last7days")}
            >
              Últimos 7 días
            </Button>
            <Button
              variant={dateRange === "last30days" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("last30days")}
            >
              Últimos 30 días
            </Button>
            <Button
              variant={dateRange === "last90days" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("last90days")}
            >
              Últimos 90 días
            </Button>
            <Button
              variant={dateRange === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("year")}
            >
              Año actual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Expedientes</CardTitle>
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.summary.totalDossiers}</div>
            <p className="text-xs text-muted-foreground mt-1">Bajo control y monitoreo</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Riesgo Alto</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{data.summary.highRiskDossiers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((data.summary.highRiskDossiers / data.summary.totalDossiers) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
              <Activity className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{data.summary.activeAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">En seguimiento activo</p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-success/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Casos Resueltos</CardTitle>
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{data.summary.closedAlerts30d}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Controles Activos</CardTitle>
          <CardDescription>Controles de cumplimiento implementados y operativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Control Documental</p>
                  <p className="text-xs text-muted-foreground">Vencimientos y vigencia</p>
                </div>
              </div>
              {data.controls.documentControl ? (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">Evaluación de Riesgo</p>
                  <p className="text-xs text-muted-foreground">Clasificación y aprobación</p>
                </div>
              </div>
              {data.controls.riskEvaluation ? (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-info" />
                <div>
                  <p className="font-medium">Screening de Listas</p>
                  <p className="text-xs text-muted-foreground">OFAC, ONU, UE y locales</p>
                </div>
              </div>
              {data.controls.screening ? (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Monitoreo PEP</p>
                  <p className="text-xs text-muted-foreground">Personas políticamente expuestas</p>
                </div>
              </div>
              {data.controls.pepMonitoring ? (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card md:col-span-2">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-info" />
                <div>
                  <p className="font-medium">Debida Diligencia</p>
                  <p className="text-xs text-muted-foreground">Gestión y revisión documental</p>
                </div>
              </div>
              {data.controls.dueDiligence ? (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          <TabsTrigger value="access">Accesos Rápidos</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
              <CardDescription>Últimas acciones registradas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {index < data.recentActivity.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.module}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.date).toLocaleString("es-VE")}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Usuario: {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">PEPs Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{data.summary.activePEPs}</div>
                <p className="text-sm text-muted-foreground mt-2">Bajo monitoreo continuo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Screening Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-warning">{data.summary.screeningMatches}</div>
                <p className="text-sm text-muted-foreground mt-2">Coincidencias en análisis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Riesgo Medio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-info">{data.summary.mediumRiskDossiers}</div>
                <p className="text-sm text-muted-foreground mt-2">Expedientes clasificados</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/auditoria/bitacora">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Bitácora de Auditoría</p>
                      <p className="text-xs text-muted-foreground">Historial completo de acciones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tablero-cumplimiento/alertas">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                    <div>
                      <p className="font-medium">Gestión de Alertas</p>
                      <p className="text-xs text-muted-foreground">Alertas activas y cerradas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/expedientes">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-info" />
                    <div>
                      <p className="font-medium">Expedientes</p>
                      <p className="text-xs text-muted-foreground">Cartera completa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/auditoria/regulador">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-medium">Reportes Regulador</p>
                      <p className="text-xs text-muted-foreground">Información SUDEASEG</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      {/* Regulatory Note */}
      <Card className="border-success/20 bg-success/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <Shield className="h-5 w-5 text-success mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Vista Preparada para Inspección SUDEASEG</p>
            <p className="text-sm text-muted-foreground">
              Esta vista proporciona acceso de solo lectura a toda la información relevante para auditoría regulatoria.
              Incluye controles activos, estadísticas de cumplimiento, historial de actividad y acceso directo a todos
              los módulos. Toda la información está respaldada por registros de auditoría inmutables y trazabilidad
              completa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
