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
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  MapPin,
  Building,
  Briefcase,
  DollarSign,
  Users,
  Search,
  Eye,
  Download,
  ExternalLink,
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
import { Skeleton } from "@/components/ui/skeleton"
import { PEPTab } from "./tabs/pep-tab"
import { getDossierDetail } from "@/lib/api/dossiers"
import { useAuth } from "@/lib/auth/auth-context"
import type { DossierDetail } from "@/types/dossier"

interface DossierDetailCompleteProps {
  dossierId: string
}

export function DossierDetailComplete({ dossierId }: DossierDetailCompleteProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [approvalDialogOpen, setApprovalDialogOpen] = React.useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = React.useState(false)
  const [dossier, setDossier] = React.useState<DossierDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getDossierDetail(dossierId)
        setDossier(data)
      } catch (err) {
        console.error("[v0] Error fetching dossier:", err)
        setError("Error al cargar el expediente")
      } finally {
        setLoading(false)
      }
    }

    fetchDossier()
  }, [dossierId])

  const userRole = user?.role || "AUDITOR"
  const isReadOnly = userRole === "AUDITOR" || userRole === "INSPECTOR" || userRole === "REGULADOR"
  const canApprove = userRole === "OFICIAL_CUMPLIMIENTO" && dossier?.status === "UNDER_REVIEW"

  const getStatusBadge = (status: string) => {
    const config = {
      INCOMPLETO: { label: "Incompleto", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
      EN_REVISION: { label: "En Revisión", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      REQUIERE_INFO: { label: "Requiere Info", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      OBSERVADO: { label: "Observado", className: "bg-red-500/10 text-red-500 border-red-500/20" },
      APROBADO: { label: "Aprobado", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    }
    const cfg = config[status as keyof typeof config]
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  const getRiskBadge = (risk: string) => {
    const config = {
      BAJO: { label: "Bajo", className: "bg-success/10 text-success border-success/20" },
      MEDIO: { label: "Medio", className: "bg-warning/10 text-warning border-warning/20" },
      ALTO: { label: "Alto", className: "bg-destructive/10 text-destructive border-destructive/20" },
    }
    const cfg = config[risk as keyof typeof config]
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  const getDocumentStatusBadge = (status: string) => {
    const config = {
      APROBADO: { label: "Aprobado", icon: CheckCircle, variant: "default" as const },
      PENDIENTE: { label: "Pendiente", icon: Clock, variant: "secondary" as const },
      RECHAZADO: { label: "Rechazado", icon: XCircle, variant: "destructive" as const },
    }
    const cfg = config[status as keyof typeof config]
    const Icon = cfg.icon
    return (
      <Badge variant={cfg.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    )
  }

  const getAlertLevelBadge = (level: string) => {
    const config = {
      BAJA: { label: "Baja", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      MEDIA: { label: "Media", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      ALTA: { label: "Alto", className: "bg-red-500/10 text-red-500 border-red-500/20" },
      CRITICA: { label: "Crítica", className: "bg-destructive text-destructive-foreground" },
    }
    const cfg = config[level as keyof typeof config]
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  const handleApprove = async () => {
    console.log("[v0] Aprobando expediente:", dossierId)
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
    setRejectionDialogOpen(false)
    alert("Expediente rechazado. Se ha notificado al responsable.")
    router.push("/dossiers")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !dossier) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "No se pudo cargar el expediente"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Expediente {dossier.dossierId}</h2>
            {getStatusBadge(dossier.status)}
            {dossier.isPep && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                PEP
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{dossier.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>{dossier.subjectType}</span>
            <span>•</span>
            <span className="font-mono">{dossier.documentNumber}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dossiers")}>
            Volver al Listado
          </Button>
          {!isReadOnly && (
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {canApprove && (
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

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Nivel de Riesgo</div>
                <div className="mt-1">{getRiskBadge(dossier.riskLevel)}</div>
                <div className="mt-1 text-sm font-medium">Puntaje: {dossier.currentRiskScore}/5.0</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground">Completitud</div>
                <div className="mt-2">
                  <Progress value={dossier.completenessPercentage} className="h-2" />
                  <span className="mt-1 text-sm font-medium">{dossier.completenessPercentage}%</span>
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
                    <span className="text-sm">Sin alertas</span>
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
                <div className="text-xs text-muted-foreground">{dossier.createdByRole}</div>
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
                <div className="text-xs text-muted-foreground">{dossier.lastModifiedByRole}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(dossier.lastModifiedAt).toLocaleString("es-VE")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="risk">Riesgo</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="screening">Screening</TabsTrigger>
              <TabsTrigger value="pep">PEP</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Generales</CardTitle>
                  <CardDescription>Información de identificación y ubicación</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Nombre / Razón Social</div>
                      <div className="mt-1 font-medium">{dossier.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Documento de Identidad</div>
                      <div className="mt-1 font-mono">{dossier.documentNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">País</div>
                      <div className="mt-1">{dossier.country}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Estado</div>
                      <div className="mt-1">{dossier.state}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Ciudad</div>
                      <div className="mt-1">{dossier.city}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Zona de Alto Riesgo</div>
                      <div className="mt-1">
                        {dossier.highRiskZone ? (
                          <Badge variant="destructive">Sí</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-muted-foreground">Dirección</div>
                      <div className="mt-1 flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span>{dossier.address}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-muted-foreground">Coordenadas GPS</div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-sm">
                        <span>Lat: {dossier.latitude}</span>
                        <span>•</span>
                        <span>Long: {dossier.longitude}</span>
                        <Button variant="ghost" size="sm" className="h-6">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Información Económica</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Actividad Económica</div>
                        <div className="mt-1 flex items-start gap-2">
                          <Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <span>{dossier.economicActivity}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Beneficiario Final</div>
                        <div className="mt-1 flex items-start gap-2">
                          <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <span>{dossier.beneficialOwner}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-muted-foreground">Origen de Fondos</div>
                        <div className="mt-1 flex items-start gap-2">
                          <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <span>{dossier.originOfFunds}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Productos y Canales</CardTitle>
                  <CardDescription>Productos asociados y canales de distribución</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Productos Asociados</div>
                    <div className="flex flex-wrap gap-2">
                      {dossier.products.map((product) => (
                        <Badge key={product} variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Canal de Distribución</div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {dossier.distributionChannel}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluación de Riesgos</CardTitle>
                  <CardDescription>Resultado actual y factores evaluados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border-2 border-warning/20 bg-warning/5 p-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Resultado Actual</div>
                      <div className="mt-1 text-2xl font-bold">{dossier.currentRiskScore} / 5.0</div>
                      <div className="mt-1">{getRiskBadge(dossier.riskLevel)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Evaluado por</div>
                      <div className="mt-1 font-medium">{dossier.riskEvaluationBy}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(dossier.lastRiskEvaluation).toLocaleDateString("es-VE")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-semibold">Factores de Riesgo</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Factor</TableHead>
                          <TableHead className="text-center">Puntaje</TableHead>
                          <TableHead>Observación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dossier.riskFactors.map((factor) => (
                          <TableRow key={factor.factor}>
                            <TableCell className="font-medium">{factor.factor}</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  factor.score >= 4 ? "destructive" : factor.score >= 3 ? "secondary" : "outline"
                                }
                              >
                                {factor.score}/5
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{factor.observation}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    <History className="mr-2 h-4 w-4" />
                    Ver Historial de Evaluaciones
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Debida Diligencia y Documentos</CardTitle>
                  <CardDescription>Documentación requerida y su estado actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Carga</TableHead>
                        <TableHead>Vencimiento</TableHead>
                        <TableHead>Cargado por</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dossier.documents.map((doc) => (
                        <TableRow key={doc.name}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {doc.name}
                            </div>
                          </TableCell>
                          <TableCell>{getDocumentStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-sm">{doc.uploadDate}</TableCell>
                          <TableCell className="text-sm">
                            {doc.expiryDate ? (
                              <span
                                className={
                                  new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                    ? "text-warning"
                                    : ""
                                }
                              >
                                {doc.expiryDate}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{doc.uploadedBy}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="screening" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Screening y Listas Restrictivas</CardTitle>
                  <CardDescription>Consultas realizadas y resultados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dossier.screenings.map((screening, idx) => (
                    <div key={idx} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Screening</span>
                            <Badge variant={screening.matches === 0 ? "default" : "destructive"}>
                              {screening.matches === 0 ? "Sin coincidencias" : `${screening.matches} coincidencias`}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Listas consultadas: {screening.lists.join(", ")}
                          </div>
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Decisión: </span>
                            <Badge variant={screening.decision === "APROBADO" ? "default" : "destructive"}>
                              {screening.decision}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Decidido por</div>
                          <div className="font-medium">{screening.decidedBy}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(screening.date).toLocaleString("es-VE")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent">
                    <Search className="mr-2 h-4 w-4" />
                    Ejecutar Nuevo Screening
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pep" className="space-y-4">
              <PEPTab pepInfo={dossier.pepInfo} pepHistory={dossier.pepHistory} isReadOnly={isReadOnly} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas y Seguimiento</CardTitle>
                  <CardDescription>Alertas asociadas al expediente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dossier.alerts.map((alert) => (
                      <div key={alert.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-warning" />
                              <span className="font-medium">{alert.id}</span>
                              {getAlertLevelBadge(alert.level)}
                            </div>
                            <div className="mt-2 text-sm">{alert.description}</div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Tipo: {alert.type} • Creada: {alert.createdAt}
                            </div>
                          </div>
                          <Badge variant={alert.status === "ACTIVA" ? "destructive" : "secondary"}>
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial y Auditoría</CardTitle>
                  <CardDescription>Registro cronológico completo de cambios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dossier.history.map((event, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <History className="h-4 w-4 text-primary" />
                          </div>
                          {idx < dossier.history.length - 1 && <div className="h-full w-px bg-border" />}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{event.action}</div>
                              <div className="text-sm text-muted-foreground">{event.details}</div>
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{event.user}</span>
                                <span>•</span>
                                <span>{event.role}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(event.date).toLocaleString("es-VE")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
