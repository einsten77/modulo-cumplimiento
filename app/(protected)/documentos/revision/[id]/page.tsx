"use client"

import type React from "react"
import { useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Download, CheckCircle, XCircle, AlertTriangle, History, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import type { Document, DocumentVersion, DocumentStatus } from "@/types/document"
import { DOSSIER_TYPE_LABELS } from "@/types/document"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  aprobado: { label: "Aprobado", variant: "default", icon: <CheckCircle className="h-4 w-4" /> },
  pendiente: { label: "Pendiente", variant: "secondary", icon: <FileText className="h-4 w-4" /> },
  observado: { label: "Observado", variant: "outline", icon: <AlertTriangle className="h-4 w-4" /> },
  rechazado: { label: "Rechazado", variant: "destructive", icon: <XCircle className="h-4 w-4" /> },
  vencido: { label: "Vencido", variant: "destructive", icon: <XCircle className="h-4 w-4" /> },
  proximo_vencer: { label: "Próximo a Vencer", variant: "outline", icon: <AlertTriangle className="h-4 w-4" /> },
}

// Mock data
const mockDocument: Document = {
  id: "DOC-005",
  dossierId: "INT-2024-023",
  dossierType: "intermediario",
  tipo: "licencia_sudeaseg",
  tipoDisplay: "Licencia SUDEASEG",
  estado: "observado",
  fechaCarga: "2024-11-05",
  fechaVencimiento: "2025-11-05",
  usuarioCarga: "Luis Fernández",
  usuarioCargaId: "USR-005",
  rolUsuario: "Comercial",
  observaciones: "Licencia renovada para el periodo 2024-2025",
  expediente: "INT-2024-023",
  entidad: "Corredor Delta",
  archivoUrl: "/documents/doc-005.pdf",
  archivoNombre: "licencia-corredor-delta.pdf",
  archivoTamano: 2560000,
  ultimaModificacion: "2024-11-08",
  version: 1,
  revisadoPor: "María López",
  fechaRevision: "2024-11-08",
  observacionesRevision: "Documento presenta fecha ilegible. Se requiere copia más clara del sello de SUDEASEG.",
}

const mockVersions: DocumentVersion[] = [
  {
    id: "VER-001",
    documentId: "DOC-005",
    version: 1,
    fechaCarga: "2024-11-05",
    usuarioCarga: "Luis Fernández",
    archivoUrl: "/documents/doc-005-v1.pdf",
    archivoNombre: "licencia-corredor-delta.pdf",
    observaciones: "Licencia renovada para el periodo 2024-2025",
    estado: "observado",
  },
]

export default function DocumentoRevisionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { id } = resolvedParams
  const { toast } = useToast()
  const { user } = useAuth()

  const [document, setDocument] = useState<Document | null>(mockDocument)
  const [versions, setVersions] = useState<DocumentVersion[]>(mockVersions)
  const [observaciones, setObservaciones] = useState("")
  const [motivoRechazo, setMotivoRechazo] = useState("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showObserveDialog, setShowObserveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canReview = user?.role === "OFICIAL_CUMPLIMIENTO" || user?.role === "CONSULTOR"
  const canApprove = user?.role === "OFICIAL_CUMPLIMIENTO"

  const handleApprove = async () => {
    if (!document) return

    setIsSubmitting(true)
    try {
      // API call would go here
      // await approveDocument(document.id, observaciones)

      toast({
        title: "Documento aprobado",
        description: "El documento ha sido aprobado exitosamente",
      })

      setShowApproveDialog(false)
      setObservaciones("")
      // Refresh document data
    } catch (error) {
      toast({
        title: "Error al aprobar documento",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleObserve = async () => {
    if (!document) return

    if (!observaciones.trim()) {
      toast({
        title: "Observación requerida",
        description: "Debe ingresar una observación para observar el documento",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // API call would go here
      // await observeDocument(document.id, observaciones)

      toast({
        title: "Documento observado",
        description: "El documento ha sido observado y se notificará al usuario responsable",
      })

      setShowObserveDialog(false)
      setObservaciones("")
      // Refresh document data
    } catch (error) {
      toast({
        title: "Error al observar documento",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!document) return

    if (!motivoRechazo.trim()) {
      toast({
        title: "Motivo requerido",
        description: "Debe ingresar un motivo para rechazar el documento",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // API call would go here
      // await rejectDocument(document.id, motivoRechazo)

      toast({
        title: "Documento rechazado",
        description: "El documento ha sido rechazado y se notificará al usuario responsable",
      })

      setShowRejectDialog(false)
      setMotivoRechazo("")
      // Refresh document data
    } catch (error) {
      toast({
        title: "Error al rechazar documento",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando documento...</p>
      </div>
    )
  }

  const status = statusConfig[document.estado]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/documentos/lista">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Revisión y Aprobación de Documento</h1>
                <p className="text-sm text-muted-foreground">ID: {document.id}</p>
              </div>
            </div>
            <Badge variant={status.variant} className="gap-2">
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {document.estado === "observado" && document.observacionesRevision && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Documento Observado:</strong> {document.observacionesRevision}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vista del Documento</CardTitle>
                  <CardDescription>Visualización del archivo cargado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center bg-muted/20">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">{document.archivoNombre}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {(document.archivoTamano / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button variant="outline" asChild>
                      <a href={document.archivoUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Documento
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      En producción, aquí se mostraría un visor de PDF integrado
                    </p>
                  </div>
                </CardContent>
              </Card>

              {canReview && document.estado !== "aprobado" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones de Revisión</CardTitle>
                    <CardDescription>Aprobar, observar o rechazar el documento</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {canApprove && (
                        <Button onClick={() => setShowApproveDialog(true)} className="flex-1">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar
                        </Button>
                      )}
                      <Button onClick={() => setShowObserveDialog(true)} variant="outline" className="flex-1">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Observar
                      </Button>
                      {canApprove && (
                        <Button onClick={() => setShowRejectDialog(true)} variant="destructive" className="flex-1">
                          <XCircle className="mr-2 h-4 w-4" />
                          Rechazar
                        </Button>
                      )}
                    </div>
                    <Alert>
                      <AlertDescription className="text-xs">
                        {canApprove
                          ? "Como Oficial de Cumplimiento, puede aprobar, observar o rechazar documentos."
                          : "Como Consultor, puede observar documentos. Solo el Oficial de Cumplimiento puede aprobar o rechazar."}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Tipo de Documento</Label>
                    <p className="font-medium">{document.tipoDisplay}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-muted-foreground">Entidad</Label>
                    <p className="font-medium">{document.entidad}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Expediente</Label>
                    <p className="font-medium">{document.expediente}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Tipo de Expediente</Label>
                    <Badge variant="outline">{DOSSIER_TYPE_LABELS[document.dossierType]}</Badge>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-muted-foreground">Usuario que Cargó</Label>
                    <p className="font-medium">{document.usuarioCarga}</p>
                    <p className="text-sm text-muted-foreground">{document.rolUsuario}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Fecha de Carga</Label>
                    <p className="font-medium">{new Date(document.fechaCarga).toLocaleDateString("es-VE")}</p>
                  </div>

                  {document.fechaVencimiento && (
                    <div>
                      <Label className="text-muted-foreground">Fecha de Vencimiento</Label>
                      <p className="font-medium">{new Date(document.fechaVencimiento).toLocaleDateString("es-VE")}</p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <Label className="text-muted-foreground">Versión</Label>
                    <p className="font-medium">v{document.version}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Última Modificación</Label>
                    <p className="font-medium">{new Date(document.ultimaModificacion).toLocaleDateString("es-VE")}</p>
                  </div>

                  {document.observaciones && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Observaciones del Usuario</Label>
                        <p className="text-sm mt-1">{document.observaciones}</p>
                      </div>
                    </>
                  )}

                  {document.aprobadoPor && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-muted-foreground">Aprobado Por</Label>
                        <p className="font-medium">{document.aprobadoPor}</p>
                        {document.fechaAprobacion && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(document.fechaAprobacion).toLocaleDateString("es-VE")}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historial de Versiones
                  </CardTitle>
                  <CardDescription>Versiones anteriores del documento</CardDescription>
                </CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay versiones anteriores disponibles
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {versions.map((version) => (
                        <div key={version.id} className="p-3 rounded-lg border bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">Versión {version.version}</p>
                            <Badge variant="outline" className="text-xs">
                              {statusConfig[version.estado].label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{version.archivoNombre}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Cargado por {version.usuarioCarga} el{" "}
                            {new Date(version.fechaCarga).toLocaleDateString("es-VE")}
                          </p>
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <a href={version.archivoUrl} download>
                              <Download className="mr-1 h-3 w-3" />
                              Descargar
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-semibold mb-2 text-sm">Flujo de Aprobación</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Los documentos observados deben ser corregidos por el usuario que los cargó</li>
              <li>• Los documentos rechazados requieren una nueva carga completa</li>
              <li>• Toda acción genera un registro en el historial de auditoría</li>
              <li>• Las versiones anteriores se mantienen disponibles para consulta</li>
              <li>• Se generan alertas automáticas para todas las acciones</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Documento</DialogTitle>
            <DialogDescription>
              Confirme la aprobación de este documento. El documento quedará en estado "Aprobado".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="observaciones-aprobacion">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones-aprobacion"
                placeholder="Ingrese observaciones adicionales..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {isSubmitting ? "Aprobando..." : "Confirmar Aprobación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Observe Dialog */}
      <Dialog open={showObserveDialog} onOpenChange={setShowObserveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Observar Documento</DialogTitle>
            <DialogDescription>
              Registre las observaciones que debe corregir el usuario. El documento quedará en estado "Observado".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="observaciones-observar">Observaciones *</Label>
              <Textarea
                id="observaciones-observar"
                placeholder="Describa claramente qué debe corregirse en el documento..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                Sea específico sobre los cambios requeridos para facilitar la corrección
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowObserveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleObserve} disabled={isSubmitting} variant="outline">
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Enviar Observaciones"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Documento</DialogTitle>
            <DialogDescription>
              El documento será rechazado permanentemente. El usuario deberá cargar un nuevo documento desde cero.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta acción no se puede deshacer. Use "Observar" si el documento puede ser corregido.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="motivo-rechazo">Motivo del Rechazo *</Label>
              <Textarea
                id="motivo-rechazo"
                placeholder="Explique detalladamente por qué se rechaza este documento..."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReject} disabled={isSubmitting} variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              {isSubmitting ? "Rechazando..." : "Confirmar Rechazo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
