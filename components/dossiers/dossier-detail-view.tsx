"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  User,
  Calendar,
  Edit,
  CheckCheck,
  XCircle,
  History,
  Shield,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DossierDetailViewProps {
  dossierId: string
}

export function DossierDetailView({ dossierId }: DossierDetailViewProps) {
  const router = useRouter()
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [approvalDialogOpen, setApprovalDialogOpen] = React.useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = React.useState(false)

  // Simular datos del expediente (en producción vendría de API)
  const dossier = {
    id: dossierId,
    dossierId: "DOSS-2024-00001",
    subjectType: "CLIENT",
    name: "INVERSIONES LA CANDELARIA C.A.",
    documentNumber: "J-12345678-9",
    riskLevel: "MEDIUM",
    status: "UNDER_REVIEW",
    completenessPercentage: 85,
    createdAt: "2024-01-15T10:30:00Z",
    createdBy: "juan.perez",
    lastModifiedAt: "2024-01-20T14:22:00Z",
    lastModifiedBy: "maria.lopez",
    approvedAt: null,
    approvedBy: null,
    alertCount: 2,
  }

  // Simular rol del usuario
  const userRole = "COMPLIANCE_OFFICER" // COMMERCIAL, COMPLIANCE_ANALYST, COMPLIANCE_OFFICER

  const canApprove = userRole === "COMPLIANCE_OFFICER" && dossier.status === "UNDER_REVIEW"

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      INCOMPLETE: { label: "Incompleto", variant: "secondary" as const, icon: Clock },
      UNDER_REVIEW: { label: "En Revisión", variant: "default" as const, icon: FileText },
      REQUIRES_INFO: { label: "Requiere Info", variant: "outline" as const, icon: AlertCircle },
      OBSERVED: { label: "Observado", variant: "destructive" as const, icon: AlertTriangle },
      APPROVED: { label: "Aprobado", variant: "default" as const, icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon

    return (
      <Badge variant={config?.variant} className="gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {config?.label}
      </Badge>
    )
  }

  const getRiskBadge = (risk: string) => {
    const riskConfig = {
      LOW: { label: "Bajo", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      MEDIUM: { label: "Medio", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      HIGH: { label: "Alto", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    }

    const config = riskConfig[risk as keyof typeof riskConfig]

    return (
      <Badge variant="outline" className={config?.className}>
        {config?.label}
      </Badge>
    )
  }

  const handleApprove = async () => {
    console.log("[v0] Aprobando expediente:", dossierId)
    // API call to approve
    setApprovalDialogOpen(false)
    alert("Expediente aprobado exitosamente")
    router.push("/dossiers")
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Debe indicar el motivo del rechazo")
      return
    }

    console.log("[v0] Rechazando expediente:", dossierId, "Razón:", rejectionReason)
    // API call to reject with reason
    setRejectionDialogOpen(false)
    alert("Expediente rechazado. Se ha notificado al responsable.")
    router.push("/dossiers")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Expediente {dossier.dossierId}</h2>
            {getStatusBadge(dossier.status)}
          </div>
          <p className="text-lg text-muted-foreground">{dossier.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dossiers")}>
            Volver al Listado
          </Button>
          {userRole !== "AUDITOR" && userRole !== "INSPECTOR" && (
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Status and Approval Section */}
      {dossier.status === "UNDER_REVIEW" && canApprove && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pendiente de Aprobación</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="flex items-center justify-between">
              <span>Este expediente está listo para su revisión final y aprobación como Oficial de Cumplimiento.</span>
              <div className="flex gap-2">
                <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rechazar Expediente</DialogTitle>
                      <DialogDescription>
                        Indique las observaciones o información faltante que requiere corrección
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="rejection-reason">Motivo del Rechazo</Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Especifique claramente las razones del rechazo..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleReject}>
                        Confirmar Rechazo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Aprobar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aprobar Expediente</DialogTitle>
                      <DialogDescription>
                        ¿Está seguro que desea aprobar este expediente? Esta acción quedará registrada en auditoría.
                      </DialogDescription>
                    </DialogHeader>
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Una vez aprobado, el expediente no podrá eliminarse y los cambios futuros requerirán aprobación
                        previa.
                      </AlertDescription>
                    </Alert>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleApprove}>Confirmar Aprobación</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Tipo de Expediente</div>
                <div className="font-medium">Cliente</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Documento de Identidad</div>
                <div className="font-mono">{dossier.documentNumber}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Nivel de Riesgo</div>
                <div className="mt-1">{getRiskBadge(dossier.riskLevel)}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Completitud</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${dossier.completenessPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{dossier.completenessPercentage}%</span>
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Alertas Activas</div>
                <div className="mt-1">
                  {dossier.alertCount > 0 ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {dossier.alertCount} alertas
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin alertas</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trazabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Creado por
                </div>
                <div className="mt-1 font-medium">{dossier.createdBy}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(dossier.createdAt).toLocaleString("es-VE")}
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Edit className="h-4 w-4" />
                  Última modificación
                </div>
                <div className="mt-1 font-medium">{dossier.lastModifiedBy}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(dossier.lastModifiedAt).toLocaleString("es-VE")}
                </div>
              </div>
              {dossier.approvedBy && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      Aprobado por
                    </div>
                    <div className="mt-1 font-medium">{dossier.approvedBy}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(dossier.approvedAt!).toLocaleString("es-VE")}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Detallada</CardTitle>
              <CardDescription>Datos completos del expediente y documentación adjunta</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="identification" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="identification">Identificación</TabsTrigger>
                  <TabsTrigger value="economic">Económica</TabsTrigger>
                  <TabsTrigger value="relationship">Relación</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="mr-1 h-4 w-4" />
                    Historial
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="identification" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Razón Social</div>
                      <div className="font-medium">{dossier.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">RIF</div>
                      <div className="font-mono">{dossier.documentNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">País</div>
                      <div className="font-medium">Venezuela</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Estado</div>
                      <div className="font-medium">Miranda</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">Dirección</div>
                      <div className="font-medium">Av. Francisco de Miranda, Torre Empresarial, Piso 10, Chacao</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="economic" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Actividad Económica</div>
                      <div className="font-medium">Comercio</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ingresos Mensuales</div>
                      <div className="font-medium">USD 50,000</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">Origen de Fondos</div>
                      <div className="font-medium">
                        Actividad comercial de importación y distribución de equipos industriales
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="relationship" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Fecha de Inicio</div>
                      <div className="font-medium">15/01/2024</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Canal de Distribución</div>
                      <div className="font-medium">Directo</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">Productos Asociados</div>
                      <div className="font-medium">Seguro de Transporte de Mercancías, Responsabilidad Civil</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    {[
                      { name: "Registro Mercantil", status: "approved", date: "15/01/2024" },
                      { name: "RIF", status: "approved", date: "15/01/2024" },
                      { name: "Estados Financieros", status: "pending", date: "-" },
                    ].map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-xs text-muted-foreground">{doc.date}</div>
                          </div>
                        </div>
                        {doc.status === "approved" ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Aprobado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    {[
                      {
                        date: "20/01/2024 14:22",
                        user: "maria.lopez",
                        action: "Modificó información económica",
                        type: "edit",
                      },
                      {
                        date: "18/01/2024 16:30",
                        user: "ana.garcia",
                        action: "Envió a revisión de cumplimiento",
                        type: "submit",
                      },
                      {
                        date: "15/01/2024 10:30",
                        user: "juan.perez",
                        action: "Creó el expediente",
                        type: "create",
                      },
                    ].map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <History className="h-4 w-4 text-primary" />
                          </div>
                          {index < 2 && <div className="h-full w-px bg-border" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="font-medium">{event.action}</div>
                          <div className="text-sm text-muted-foreground">
                            Por {event.user} • {event.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
