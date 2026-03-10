"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Search, Filter, Eye, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import Link from "next/link"
import { type Alert, AlertLevel, AlertStatus } from "@/types/alert"

export default function GestionAlertasPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [actionDialog, setActionDialog] = useState<"seguimiento" | "cerrar" | "asignar" | null>(null)
  const [actionComment, setActionComment] = useState("")
  const [assignedUser, setAssignedUser] = useState("")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("estado") || "TODOS")
  const [levelFilter, setLevelFilter] = useState(searchParams.get("nivel") || "TODOS")
  const [moduleFilter, setModuleFilter] = useState("TODOS")

  useEffect(() => {
    fetchAlerts()
  }, [statusFilter, levelFilter, moduleFilter])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "TODOS") params.append("status", statusFilter)
      if (levelFilter !== "TODOS") params.append("level", levelFilter)
      if (moduleFilter !== "TODOS") params.append("module", moduleFilter)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/alerts?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar alertas")

      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      console.error("[v0] Error fetching alerts:", error)
      // Mock data for preview
      setAlerts([
        {
          alertId: "1",
          alertCode: "ALT-2024-001",
          alertType: "Documento Vencido",
          alertLevel: AlertLevel.CRÍTICA,
          originModule: "DOCUMENT",
          dossierId: "DOS-001",
          entityType: "CLIENT",
          entityName: "Juan Pérez",
          entityIdentification: "V-12345678",
          status: AlertStatus.NUEVA,
          description: "RIF vencido hace 15 días",
          detectedAt: new Date().toISOString(),
          detectedBy: "SYSTEM",
          requiresAction: true,
          priorityScore: 95,
          notificationSent: true,
          escalated: false,
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarSeguimiento = async () => {
    if (!selectedAlert || !actionComment.trim()) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/alerts/${selectedAlert.alertId}/tracking`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "MARCAR_SEGUIMIENTO",
            comments: actionComment,
            newStatus: AlertStatus.EN_SEGUIMIENTO,
          }),
        },
      )

      if (!response.ok) throw new Error("Error al marcar seguimiento")

      await fetchAlerts()
      setActionDialog(null)
      setActionComment("")
      setSelectedAlert(null)
    } catch (error) {
      console.error("[v0] Error marking follow-up:", error)
      alert("Error al marcar seguimiento")
    }
  }

  const handleCerrarAlerta = async () => {
    if (!selectedAlert || !actionComment.trim()) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/alerts/${selectedAlert.alertId}/close`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            closureReason: actionComment,
          }),
        },
      )

      if (!response.ok) throw new Error("Error al cerrar alerta")

      await fetchAlerts()
      setActionDialog(null)
      setActionComment("")
      setSelectedAlert(null)
    } catch (error) {
      console.error("[v0] Error closing alert:", error)
      alert("Error al cerrar alerta")
    }
  }

  const getLevelBadge = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.CRÍTICA:
        return <Badge variant="destructive">{level}</Badge>
      case AlertLevel.ALTA:
        return <Badge className="bg-warning text-warning-foreground">{level}</Badge>
      case AlertLevel.MEDIA:
        return <Badge className="bg-info/20 text-info">{level}</Badge>
      case AlertLevel.BAJA:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.NUEVA:
        return <Badge variant="default">{status.replace("_", " ")}</Badge>
      case AlertStatus.EN_SEGUIMIENTO:
        return <Badge className="bg-warning text-warning-foreground">{status.replace("_", " ")}</Badge>
      case AlertStatus.ATENDIDA:
        return <Badge className="bg-info text-info-foreground">{status}</Badge>
      case AlertStatus.CERRADA:
        return <Badge className="bg-success text-success-foreground">{status}</Badge>
    }
  }

  const getLevelIcon = (level: AlertLevel) => {
    if (level === AlertLevel.CRÍTICA || level === AlertLevel.ALTA) {
      return <AlertTriangle className="h-5 w-5 text-destructive" />
    }
    return <Clock className="h-5 w-5 text-muted-foreground" />
  }

  // RBAC checks
  const canEdit = user?.role === "OFICIAL_CUMPLIMIENTO" || user?.role === "UNIDAD_CUMPLIMIENTO"
  const canClose = user?.role === "OFICIAL_CUMPLIMIENTO"

  const filteredAlerts = alerts.filter((alert) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        alert.alertCode.toLowerCase().includes(query) ||
        alert.entityName.toLowerCase().includes(query) ||
        alert.dossierId.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Gestión de Alertas</h1>
          <p className="text-muted-foreground">Control centralizado de todas las alertas del sistema</p>
        </div>
        <Link href="/tablero-cumplimiento">
          <Button variant="outline">Volver al Tablero</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Críticas</p>
                <p className="text-3xl font-bold text-destructive">
                  {alerts.filter((a) => a.alertLevel === AlertLevel.CRÍTICA).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nuevas</p>
                <p className="text-3xl font-bold text-primary">
                  {alerts.filter((a) => a.status === AlertStatus.NUEVA).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">En Seguimiento</p>
                <p className="text-3xl font-bold text-warning">
                  {alerts.filter((a) => a.status === AlertStatus.EN_SEGUIMIENTO).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cerradas (30d)</p>
                <p className="text-3xl font-bold text-success">
                  {alerts.filter((a) => a.status === AlertStatus.CERRADA).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, expediente o entidad..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                <SelectItem value="NUEVA">Nueva</SelectItem>
                <SelectItem value="EN_SEGUIMIENTO">En Seguimiento</SelectItem>
                <SelectItem value="ATENDIDA">Atendida</SelectItem>
                <SelectItem value="CERRADA">Cerrada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los niveles</SelectItem>
                <SelectItem value="CRÍTICA">Crítica</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="MEDIA">Media</SelectItem>
                <SelectItem value="BAJA">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los módulos</SelectItem>
                <SelectItem value="DOCUMENT">Documentos</SelectItem>
                <SelectItem value="RISK">Riesgo</SelectItem>
                <SelectItem value="SCREENING">Screening</SelectItem>
                <SelectItem value="PEP">PEP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Listado de Alertas ({filteredAlerts.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Código</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Expediente</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Entidad</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Nivel</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.alertId} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(alert.alertLevel)}
                        <span className="font-mono text-sm font-medium">{alert.alertCode}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium">{alert.alertType}</p>
                        <p className="text-xs text-muted-foreground">{alert.originModule}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">{alert.dossierId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium">{alert.entityName}</p>
                        <p className="text-xs text-muted-foreground">{alert.entityIdentification}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getLevelBadge(alert.alertLevel)}</td>
                    <td className="py-4 px-4">{getStatusBadge(alert.status)}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm">{new Date(alert.detectedAt).toLocaleDateString("es-VE")}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tablero-cumplimiento/alertas/${alert.alertId}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && alert.status === AlertStatus.NUEVA && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setActionDialog("seguimiento")
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                        {canClose && alert.status !== AlertStatus.CERRADA && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert)
                              setActionDialog("cerrar")
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Marcar Seguimiento */}
      <Dialog open={actionDialog === "seguimiento"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como En Seguimiento</DialogTitle>
            <DialogDescription>Registre las acciones que está tomando para atender esta alerta</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Alerta</Label>
              <p className="text-sm font-mono text-muted-foreground">{selectedAlert?.alertCode}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Comentario de Seguimiento *</Label>
              <Textarea
                id="comment"
                placeholder="Describa las acciones que está realizando..."
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Este comentario quedará registrado en el historial de auditoría
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleMarcarSeguimiento} disabled={!actionComment.trim()}>
              Confirmar Seguimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cerrar Alerta */}
      <Dialog open={actionDialog === "cerrar"} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Alerta</DialogTitle>
            <DialogDescription>Documente la resolución de esta alerta antes de cerrarla</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Alerta</Label>
              <p className="text-sm font-mono text-muted-foreground">{selectedAlert?.alertCode}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="closure">Motivo de Cierre *</Label>
              <Textarea
                id="closure"
                placeholder="Explique cómo se resolvió la alerta y las acciones tomadas..."
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                El cierre de alertas es permanente y queda registrado para auditoría
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleCerrarAlerta} disabled={!actionComment.trim()} variant="destructive">
              Cerrar Alerta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compliance Note */}
      <Card className="border-info/20 bg-info/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <CheckCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Gestión de Alertas - Cumplimiento Regulatorio</p>
            <p className="text-sm text-muted-foreground">
              Las alertas nunca se eliminan del sistema. Solo pueden cambiar de estado mediante el flujo de seguimiento
              documentado. Cada acción queda registrada con usuario, fecha y comentarios en el historial de auditoría
              para inspección de SUDEASEG.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
