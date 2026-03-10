"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, Download, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface HistoryEntry {
  fecha: string
  usuario: string
  accion: string
  comentario?: string
}

const mockPendingDocument = {
  id: "DOC-004",
  tipo: "Cédula de Identidad",
  expediente: "EMP-2024-042",
  entidad: "Pedro Martínez",
  fechaCarga: "2024-12-10",
  fechaVencimiento: "2027-05-15",
  usuarioCarga: "Ana Torres (RRHH)",
  observaciones: "Documento escaneado por ambas caras",
  archivoUrl: "#",
  historial: [
    {
      fecha: "2024-12-10 09:30",
      usuario: "Ana Torres (RRHH)",
      accion: "Carga de documento",
      comentario: "Documento inicial cargado al sistema",
    },
  ] as HistoryEntry[],
}

export default function RevisionPage() {
  const { toast } = useToast()
  const [comentario, setComentario] = useState("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showObserveDialog, setShowObserveDialog] = useState(false)

  const handleApprove = () => {
    toast({
      title: "Documento aprobado",
      description: "El documento ha sido aprobado y notificado al usuario responsable",
    })
    setShowApproveDialog(false)
    setComentario("")
  }

  const handleReject = () => {
    if (!comentario.trim()) {
      toast({
        title: "Comentario requerido",
        description: "Debe proporcionar un motivo para rechazar el documento",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Documento rechazado",
      description: "El documento ha sido rechazado y se notificó al usuario con sus comentarios",
    })
    setShowRejectDialog(false)
    setComentario("")
  }

  const handleObserve = () => {
    if (!comentario.trim()) {
      toast({
        title: "Comentario requerido",
        description: "Debe proporcionar observaciones obligatorias",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Documento observado",
      description: "El documento ha sido marcado con observaciones para corrección",
    })
    setShowObserveDialog(false)
    setComentario("")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Revisión y Aprobación de Documentos</h1>
              <p className="text-sm text-muted-foreground">Módulo exclusivo de la Unidad de Cumplimiento</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">{mockPendingDocument.tipo}</CardTitle>
                  <CardDescription>
                    Expediente: {mockPendingDocument.expediente} - {mockPendingDocument.entidad}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Pendiente de Revisión
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Detalles del Documento</TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="mr-2 h-4 w-4" />
                    Historial
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">ID del Documento</Label>
                      <p className="font-mono text-sm">{mockPendingDocument.id}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Tipo de Documento</Label>
                      <p className="font-medium">{mockPendingDocument.tipo}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Expediente</Label>
                      <p className="font-medium">{mockPendingDocument.expediente}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Entidad/Persona</Label>
                      <p className="font-medium">{mockPendingDocument.entidad}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Fecha de Carga</Label>
                      <p>{new Date(mockPendingDocument.fechaCarga).toLocaleDateString("es-VE")}</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Fecha de Vencimiento</Label>
                      <p>{new Date(mockPendingDocument.fechaVencimiento).toLocaleDateString("es-VE")}</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Usuario que Cargó</Label>
                      <p>{mockPendingDocument.usuarioCarga}</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Observaciones del Usuario</Label>
                      <p className="text-sm">{mockPendingDocument.observaciones}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver documento adjunto (documento_pedro_martinez.pdf)
                      <Download className="ml-auto h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <div className="space-y-4">
                    {mockPendingDocument.historial.map((entry, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <History className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{entry.accion}</p>
                            <p className="text-xs text-muted-foreground">{entry.fecha}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.usuario}</p>
                          {entry.comentario && (
                            <p className="text-sm mt-2 p-2 rounded bg-background">{entry.comentario}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-6 border-t mt-6">
                <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Aprobar Documento</DialogTitle>
                      <DialogDescription>
                        ¿Está seguro que desea aprobar este documento? Esta acción quedará registrada en el historial de
                        auditoría.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleApprove}>Confirmar Aprobación</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showObserveDialog} onOpenChange={setShowObserveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Observar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Observar Documento</DialogTitle>
                      <DialogDescription>
                        Indique las observaciones que debe corregir el usuario. El comentario es obligatorio.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="observacion">Observaciones *</Label>
                        <Textarea
                          id="observacion"
                          placeholder="Describa las correcciones necesarias..."
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowObserveDialog(false)
                          setComentario("")
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleObserve}>Guardar Observación</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rechazar Documento</DialogTitle>
                      <DialogDescription>
                        Indique el motivo del rechazo. El comentario es obligatorio y será notificado al usuario.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="rechazo">Motivo del Rechazo *</Label>
                        <Textarea
                          id="rechazo"
                          placeholder="Describa el motivo del rechazo..."
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRejectDialog(false)
                          setComentario("")
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleReject}>
                        Confirmar Rechazo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
