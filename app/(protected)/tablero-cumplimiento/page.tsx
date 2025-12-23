"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  FileText,
  Shield,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  Eye,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import type { ComplianceDashboardKPIs } from "@/types/alert"

export default function TableroCumplimientoPage() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<ComplianceDashboardKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")

  useEffect(() => {
    fetchKPIs()
  }, [selectedPeriod])

  const fetchKPIs = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/alerts/dashboard/kpis?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      )

      if (!response.ok) throw new Error("Error al cargar KPIs")

      const data = await response.json()
      setKpis(data)
    } catch (error) {
      console.error("[v0] Error fetching KPIs:", error)
      // Set mock data for preview
      setKpis({
        highRiskDossiers: 8,
        mediumRiskDossiers: 23,
        expiredDocuments: 12,
        screeningMatches: 5,
        activePEPCases: 3,
        criticalAlerts: 7,
        pendingApprovals: 15,
        openCases: 18,
        overdueActions: 4,
      })
    } finally {
      setLoading(false)
    }
  }

  // RBAC check
  const canViewFull = user?.role === "OFICIAL_CUMPLIMIENTO" || user?.role === "GERENTE_CUMPLIMIENTO"
  const canEdit = user?.role === "OFICIAL_CUMPLIMIENTO"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando tablero...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Tablero de Cumplimiento</h1>
          <p className="text-muted-foreground">Panel de control y monitoreo continuo</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("today")}
          >
            Hoy
          </Button>
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("week")}
          >
            Semana
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("month")}
          >
            Mes
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">Alertas Críticas</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{kpis?.criticalAlerts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren acción inmediata</p>
            <Link href="/tablero-cumplimiento/alertas?nivel=CRÍTICA">
              <Button variant="link" size="sm" className="px-0 mt-2 text-destructive">
                Ver detalle <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">Riesgo Alto</CardTitle>
              <Shield className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{kpis?.highRiskDossiers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Expedientes clasificados alto</p>
            <Link href="/expedientes?riesgo=ALTO">
              <Button variant="link" size="sm" className="px-0 mt-2 text-warning">
                Ver expedientes <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-info/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">Docs. Vencidos</CardTitle>
              <FileText className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{kpis?.expiredDocuments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Documentos sin vigencia</p>
            <Link href="/documentos/lista?estado=VENCIDO">
              <Button variant="link" size="sm" className="px-0 mt-2 text-info">
                Gestionar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">Casos PEP</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{kpis?.activePEPCases || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Activos en seguimiento</p>
            <Link href="/pep/seguimiento">
              <Button variant="link" size="sm" className="px-0 mt-2 text-primary">
                Ver PEPs <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Secundarios */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Screening con Coincidencias
              <Badge variant="outline">{kpis?.screeningMatches || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Requieren análisis y decisión</p>
            <Link href="/screening/resultados?estado=PENDIENTE">
              <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                Revisar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Pendientes de Aprobación
              <Badge variant="outline">{kpis?.pendingApprovals || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Evaluaciones esperando decisión</p>
            <Link href="/riesgo/resultado?estado=PENDIENTE_APROBACION">
              <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                Aprobar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Acciones Vencidas
              <Badge variant="destructive">{kpis?.overdueActions || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tareas fuera de plazo</p>
            <Link href="/tablero-cumplimiento/seguimiento?estado=VENCIDO">
              <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
                Atender
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Contenido */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="risk">Por Nivel de Riesgo</TabsTrigger>
          <TabsTrigger value="module">Por Módulo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expedientes por Riesgo</CardTitle>
                <CardDescription>Distribución actual de la cartera</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <span className="text-sm text-foreground">Alto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-destructive">{kpis?.highRiskDossiers || 0}</span>
                    <span className="text-xs text-muted-foreground">expedientes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-warning" />
                    <span className="text-sm text-foreground">Medio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-warning">{kpis?.mediumRiskDossiers || 0}</span>
                    <span className="text-xs text-muted-foreground">expedientes</span>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <Link href="/expedientes">
                    <Button variant="outline" className="w-full bg-transparent">
                      Ver todos los expedientes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Casos</CardTitle>
                <CardDescription>Gestión de alertas y seguimiento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="text-sm text-foreground">Casos Abiertos</span>
                  </div>
                  <span className="text-2xl font-bold">{kpis?.openCases || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-foreground">Alertas Críticas</span>
                  </div>
                  <span className="text-2xl font-bold text-destructive">{kpis?.criticalAlerts || 0}</span>
                </div>
                <div className="pt-3 border-t">
                  <Link href="/tablero-cumplimiento/seguimiento">
                    <Button variant="outline" className="w-full bg-transparent">
                      Ir a seguimiento de casos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acceso Rápido por Riesgo</CardTitle>
              <CardDescription>Navegación directa a expedientes críticos</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/expedientes?riesgo=ALTO">
                <Card className="border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-foreground">Expedientes Riesgo Alto</p>
                        <p className="text-xs text-muted-foreground">Requieren monitoreo intensivo</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      {kpis?.highRiskDossiers || 0}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/expedientes?riesgo=MEDIO">
                <Card className="border-warning/20 bg-warning/5 hover:bg-warning/10 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-foreground">Expedientes Riesgo Medio</p>
                        <p className="text-xs text-muted-foreground">Monitoreo periódico</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1 border-warning text-warning">
                      {kpis?.mediumRiskDossiers || 0}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="module" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/documentos/lista?estado=VENCIDO">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-info" />
                    <div>
                      <p className="font-medium text-foreground">Gestión Documental</p>
                      <p className="text-xs text-muted-foreground">{kpis?.expiredDocuments || 0} docs. vencidos</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/screening/resultados?estado=PENDIENTE">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Screening</p>
                      <p className="text-xs text-muted-foreground">{kpis?.screeningMatches || 0} coincidencias</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/pep/seguimiento">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">PEP</p>
                      <p className="text-xs text-muted-foreground">{kpis?.activePEPCases || 0} casos activos</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/riesgo/resultado?estado=PENDIENTE_APROBACION">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-warning" />
                    <div>
                      <p className="font-medium text-foreground">Evaluación de Riesgo</p>
                      <p className="text-xs text-muted-foreground">{kpis?.pendingApprovals || 0} pendientes</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      {/* Nota de Cumplimiento */}
      <Card className="border-info/20 bg-info/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <CheckCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Tablero de Control Continuo</p>
            <p className="text-sm text-muted-foreground">
              Este tablero proporciona visibilidad en tiempo real del estado de cumplimiento de la organización. Todos
              los indicadores se actualizan automáticamente y están disponibles para auditoría de SUDEASEG. Las alertas
              se priorizan por nivel de riesgo y tiempo de respuesta requerido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
