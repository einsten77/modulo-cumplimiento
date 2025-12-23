"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Clock, User, FileText, Download, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth/auth-context"
import type { PepHistory, PepAlert } from "@/types/pep"

export default function PepFollowUpPage() {
  const searchParams = useSearchParams()
  const pepId = searchParams.get("id")
  const { user } = useAuth()

  const [history, setHistory] = useState<PepHistory[]>([])
  const [alerts, setAlerts] = useState<PepAlert[]>([])
  const [pepDeclaration, setPepDeclaration] = useState<any>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [userFilter, setUserFilter] = useState("todos")
  const [actionFilter, setActionFilter] = useState("todas")

  useEffect(() => {
    if (pepId) {
      fetchPepData()
      fetchHistory()
      fetchAlerts()
    }
  }, [pepId])

  const fetchPepData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/declarations/${pepId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setPepDeclaration(data)
      }
    } catch (error) {
      console.error("Error fetching PEP data:", error)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/declarations/${pepId}/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/declarations/${pepId}/alerts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.filter((a: PepAlert) => a.status === "ACTIVE"))
      }
    } catch (error) {
      console.error("Error fetching alerts:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      APPROVED: { label: "Aprobado", variant: "default" },
      REJECTED: { label: "Rechazado", variant: "destructive" },
      COMPLETED: { label: "Completado", variant: "secondary" },
    }
    const config = variants[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getAlertSeverityColor = (severity: string) => {
    return severity === "HIGH" ? "border-destructive" : severity === "MEDIUM" ? "border-warning" : "border-info"
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Seguimiento PEP</h1>
                <p className="text-sm text-muted-foreground">C.A. de Seguros la Occidental - Regulado por SUDEASEG</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.role}</p>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Seguimiento y Trazabilidad PEP</h2>
          <p className="text-muted-foreground">
            Historial completo de cambios de condición PEP sin eliminación de registros
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            {pepDeclaration && (
              <Card>
                <CardHeader>
                  <CardTitle>Información del Expediente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Expediente</p>
                      <p className="font-semibold">{pepDeclaration.dossierNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                      <p className="font-semibold">{pepDeclaration.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Documento</p>
                      <p className="font-semibold">{pepDeclaration.documentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Condición Actual</p>
                      <Badge className="bg-warning text-warning-foreground">{pepDeclaration.pepCondition}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cargo</p>
                      <p className="font-semibold">{pepDeclaration.position || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Desde</p>
                      <p className="font-semibold">
                        {pepDeclaration.startDate ? new Date(pepDeclaration.startDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Alertas Activas</CardTitle>
                  <CardDescription>Notificaciones y acciones pendientes relacionadas con este PEP</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-3 border-l-4 ${getAlertSeverityColor(alert.severity)} pl-3 py-2`}
                      >
                        <AlertCircle
                          className={`h-5 w-5 mt-0.5 ${
                            alert.severity === "HIGH"
                              ? "text-destructive"
                              : alert.severity === "MEDIUM"
                                ? "text-warning"
                                : "text-info"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium">Fecha:</span> {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={alert.severity === "HIGH" ? "destructive" : "secondary"}>{alert.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Filtros de Búsqueda</CardTitle>
                    <CardDescription>Refine el historial por fecha, usuario o tipo de acción</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-desde">Desde</Label>
                    <Input
                      id="fecha-desde"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha-hasta">Hasta</Label>
                    <Input id="fecha-hasta" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usuario">Usuario</Label>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger id="usuario">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los usuarios</SelectItem>
                        <SelectItem value="sistema">Sistema SIAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accion">Tipo de Acción</Label>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger id="accion">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las acciones</SelectItem>
                        <SelectItem value="creacion">Creación</SelectItem>
                        <SelectItem value="modificacion">Modificación</SelectItem>
                        <SelectItem value="aprobacion">Aprobación</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Registro Cronológico</h3>
                <p className="text-sm text-muted-foreground">{history.length} registros en total</p>
              </div>

              {history.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay registros de historial disponibles</p>
                  </CardContent>
                </Card>
              ) : (
                history.map((record, index) => (
                  <Card key={record.id} className={index === 0 ? "border-primary/50" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{record.action}</h4>
                              {getStatusBadge(record.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {record.performedBy}
                              </span>
                              <span>•</span>
                              <span>{record.performedByRole}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(record.performedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {record.previousCondition && record.newCondition && (
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Condición Anterior</p>
                            <Badge variant="outline">{record.previousCondition}</Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Condición Nueva</p>
                            <Badge
                              className={
                                record.newCondition.includes("CURRENT_PEP") ||
                                record.newCondition.includes("PEP Actual")
                                  ? "bg-warning text-warning-foreground"
                                  : record.newCondition === "NO_PEP" || record.newCondition === "No PEP"
                                    ? "bg-success text-success-foreground"
                                    : ""
                              }
                            >
                              {record.newCondition}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {(record.previousPosition || record.newPosition) && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Cargo Público</p>
                          <p className="text-sm text-foreground">{record.newPosition || record.previousPosition}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Justificación y Observaciones</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{record.justification}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Control de Auditoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total cambios:</span>
                  <span className="font-semibold">{history.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Alertas activas:</span>
                  <span className="font-semibold">{alerts.length}</span>
                </div>
                {pepDeclaration && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Primer registro:</span>
                      <span className="font-semibold">{new Date(pepDeclaration.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Última actualización:</span>
                      <span className="font-semibold">{new Date(pepDeclaration.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Versionamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Política de Registros:</p>
                <ul className="space-y-2 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Todos los cambios quedan registrados permanentemente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>No se permite eliminación de historial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Cada cambio incluye usuario responsable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Fecha y hora exacta con timestamp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Justificación obligatoria en cada modificación</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Acceso de Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Este historial está disponible en modo solo lectura para:</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Auditoría Interna</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Inspectores SUDEASEG</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Oficial de Cumplimiento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Comité de Cumplimiento</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href={`/pep/identificacion?id=${pepId}`}>Ver Identificación PEP</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href={`/pep/familiares?id=${pepId}`}>Ver Familiares y Asociados</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href={`/pep/medidas-reforzadas?id=${pepId}`}>Ver Medidas Reforzadas</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Exportar Historial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
