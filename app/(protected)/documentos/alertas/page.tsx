"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, AlertTriangle, Clock, AlertCircle, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { DocumentAlert } from "@/types/document"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const mockAlerts: DocumentAlert[] = [
  {
    id: "ALERT-001",
    documentId: "DOC-001",
    tipo: "vencido",
    prioridad: "alta",
    mensaje: "RIF de Seguros Alfa, C.A. vencido desde el 30/11/2024",
    fechaGeneracion: "2024-12-01",
    diasVencido: 15,
  },
  {
    id: "ALERT-007",
    documentId: "DOC-007",
    tipo: "vencido",
    prioridad: "alta",
    mensaje: "Comprobante de Domicilio de Laura Sánchez vencido desde el 20/04/2024",
    fechaGeneracion: "2024-04-21",
    diasVencido: 235,
  },
  {
    id: "ALERT-002",
    documentId: "DOC-002",
    tipo: "proximo_vencer",
    prioridad: "media",
    mensaje: "Estados Financieros de Proveedora Beta, S.A. vencen el 10/01/2025",
    fechaGeneracion: "2024-12-10",
    diasRestantes: 26,
  },
  {
    id: "ALERT-005",
    documentId: "DOC-005",
    tipo: "observado",
    prioridad: "media",
    mensaje:
      "Licencia SUDEASEG de Corredor Delta observada: Documento presenta fecha ilegible. Se requiere copia más clara.",
    fechaGeneracion: "2024-11-08",
    diasSinCorregir: 37,
  },
]

const alertTypeConfig = {
  vencido: {
    label: "Documentos Vencidos",
    description: "Requieren renovación inmediata",
    variant: "destructive" as const,
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  proximo_vencer: {
    label: "Próximos a Vencer",
    description: "Vencen en los próximos 30 días",
    variant: "outline" as const,
    icon: <Clock className="h-4 w-4 text-warning" />,
  },
  observado: {
    label: "Documentos Observados",
    description: "Requieren corrección del usuario",
    variant: "secondary" as const,
    icon: <AlertCircle className="h-4 w-4" />,
  },
  rechazado: {
    label: "Documentos Rechazados",
    description: "Requieren nueva carga",
    variant: "destructive" as const,
    icon: <AlertCircle className="h-4 w-4" />,
  },
}

export default function AlertasDocumentalesPage() {
  const [alerts, setAlerts] = useState<DocumentAlert[]>(mockAlerts)

  const alertasVencidos = alerts.filter((a) => a.tipo === "vencido")
  const alertasProximosVencer = alerts.filter((a) => a.tipo === "proximo_vencer")
  const alertasObservados = alerts.filter((a) => a.tipo === "observado")
  const alertasRechazados = alerts.filter((a) => a.tipo === "rechazado")

  const totalAlertas = alerts.length
  const alertasCriticas = alertasVencidos.length + alertasRechazados.length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Alertas Documentales</h1>
              <p className="text-sm text-muted-foreground">Seguimiento de vencimientos y observaciones</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {alertasCriticas > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Alertas Críticas</AlertTitle>
              <AlertDescription>
                Hay {alertasCriticas} alertas críticas que requieren acción inmediata. Esto representa un riesgo de
                cumplimiento regulatorio ante SUDEASEG.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalAlertas}</div>
                <p className="text-xs text-muted-foreground mt-1">Todas las categorías</p>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Vencidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{alertasVencidos.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Acción inmediata</p>
              </CardContent>
            </Card>

            <Card className="border-warning/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-warning">Próximos a Vencer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">{alertasProximosVencer.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Próximos 30 días</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Observados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alertasObservados.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Requieren corrección</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="vencidos" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vencidos" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Vencidos ({alertasVencidos.length})
              </TabsTrigger>
              <TabsTrigger value="proximos" className="gap-2">
                <Clock className="h-4 w-4" />
                Próximos ({alertasProximosVencer.length})
              </TabsTrigger>
              <TabsTrigger value="observados" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Observados ({alertasObservados.length})
              </TabsTrigger>
              <TabsTrigger value="rechazados" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Rechazados ({alertasRechazados.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vencidos" className="space-y-4">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Documentos Vencidos</CardTitle>
                  <CardDescription>Requieren renovación inmediata</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alertasVencidos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay documentos vencidos</p>
                  ) : (
                    alertasVencidos.map((alert) => (
                      <div key={alert.id} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-destructive" />
                              <p className="font-semibold">{alert.mensaje}</p>
                            </div>
                            <Badge variant="destructive" className="text-xs mt-2">
                              Vencido hace {alert.diasVencido} días
                            </Badge>
                          </div>
                          <Button size="sm" variant="destructive" asChild>
                            <Link href={`/documentos/revision/${alert.documentId}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Generada el {new Date(alert.fechaGeneracion).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proximos" className="space-y-4">
              <Card className="border-warning/50">
                <CardHeader>
                  <CardTitle className="text-warning">Documentos Próximos a Vencer</CardTitle>
                  <CardDescription>Vencen en los próximos 30 días</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alertasProximosVencer.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay documentos próximos a vencer</p>
                  ) : (
                    alertasProximosVencer.map((alert) => (
                      <div key={alert.id} className="p-4 rounded-lg border border-warning/20 bg-warning/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-warning" />
                              <p className="font-semibold">{alert.mensaje}</p>
                            </div>
                            <Badge variant="outline" className="text-xs mt-2 border-warning text-warning">
                              <Clock className="h-3 w-3 mr-1" />
                              Vence en {alert.diasRestantes} días
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/documentos/revision/${alert.documentId}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Generada el {new Date(alert.fechaGeneracion).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="observados" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Observados</CardTitle>
                  <CardDescription>Requieren corrección del usuario responsable</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alertasObservados.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay documentos observados</p>
                  ) : (
                    alertasObservados.map((alert) => (
                      <div key={alert.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold">{alert.mensaje}</p>
                            </div>
                            <Badge variant="outline" className="text-xs mt-2">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {alert.diasSinCorregir} días sin corregir
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/documentos/revision/${alert.documentId}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Generada el {new Date(alert.fechaGeneracion).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rechazados" className="space-y-4">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Documentos Rechazados</CardTitle>
                  <CardDescription>Requieren nueva carga completa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alertasRechazados.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay documentos rechazados</p>
                  ) : (
                    alertasRechazados.map((alert) => (
                      <div key={alert.id} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4 text-destructive" />
                              <p className="font-semibold">{alert.mensaje}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="destructive" asChild>
                            <Link href={`/documentos/revision/${alert.documentId}`}>
                              <Eye className="mr-1 h-4 w-4" />
                              Ver
                            </Link>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Generada el {new Date(alert.fechaGeneracion).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="p-6 rounded-lg bg-muted">
            <h3 className="font-semibold mb-3">Comportamiento de Alertas Automáticas</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Las alertas se generan automáticamente 30 días antes del vencimiento</li>
              <li>• Los documentos vencidos se marcan como críticos y requieren acción inmediata</li>
              <li>• Las alertas de documentos observados se generan después de 7 días sin corrección</li>
              <li>• Todas las alertas se notifican diariamente al Oficial de Cumplimiento</li>
              <li>• El sistema genera reportes automáticos para SUDEASEG sobre documentos vencidos</li>
              <li>• Las alertas de documentos rechazados permanecen hasta que se cargue un nuevo documento</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
