"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, Calendar, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth/auth-context"
import type { DocumentType, DossierType } from "@/types/document"
import { DOCUMENT_TYPE_LABELS, DOSSIER_TYPE_LABELS, DOCUMENTS_REQUIRING_EXPIRATION } from "@/types/document"

export default function CargaDocumentoPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [tipoDocumento, setTipoDocumento] = useState<DocumentType | "">("")
  const [tipoExpediente, setTipoExpediente] = useState<DossierType | "">("")
  const [expediente, setExpediente] = useState("")
  const [fechaVencimiento, setFechaVencimiento] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tipoDocumento || !expediente || !archivo || !tipoExpediente) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const requiereVencimiento = DOCUMENTS_REQUIRING_EXPIRATION.includes(tipoDocumento as DocumentType)
    if (requiereVencimiento && !fechaVencimiento) {
      toast({
        title: "Error de validación",
        description: "La fecha de vencimiento es obligatoria para este tipo de documento",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("archivo", archivo)
      formData.append("tipoDocumento", tipoDocumento)
      formData.append("tipoExpediente", tipoExpediente)
      formData.append("expediente", expediente)
      if (fechaVencimiento) {
        formData.append("fechaVencimiento", fechaVencimiento)
      }
      if (observaciones) {
        formData.append("observaciones", observaciones)
      }

      // API call would go here
      // await uploadDocument(formData)

      toast({
        title: "Documento cargado exitosamente",
        description: "El documento ha sido registrado y está pendiente de aprobación por Cumplimiento",
      })

      // Reset form
      setTipoDocumento("")
      setTipoExpediente("")
      setExpediente("")
      setFechaVencimiento("")
      setObservaciones("")
      setArchivo(null)

      // Reset file input
      const fileInput = document.getElementById("archivo") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      toast({
        title: "Error al cargar documento",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo no debe superar los 10MB",
          variant: "destructive",
        })
        return
      }
      setArchivo(file)
    }
  }

  const requiereVencimiento =
    tipoDocumento !== "" && DOCUMENTS_REQUIRING_EXPIRATION.includes(tipoDocumento as DocumentType)

  // Define which dossier types user can upload to based on their role
  const availableDossierTypes: DossierType[] = (() => {
    switch (user?.role) {
      case "USUARIO_COMERCIAL":
        return ["cliente", "intermediario"]
      case "USUARIO_RRHH":
        return ["empleado"]
      case "OFICIAL_CUMPLIMIENTO":
        return ["cliente", "intermediario", "proveedor", "empleado", "reasegurador"]
      default:
        return ["proveedor", "reasegurador"]
    }
  })()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/documentos/lista">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Carga de Documento</h1>
              <p className="text-sm text-muted-foreground">Agregar nuevos documentos al expediente</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Todo documento cargado quedará en estado <strong>"Pendiente de aprobación"</strong> hasta que sea revisado
              por la Unidad de Cumplimiento. Cada carga genera un registro automático en la auditoría del sistema.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Información del Documento</CardTitle>
              <CardDescription>
                Complete todos los campos requeridos. Los campos marcados con (*) son obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tipo-expediente">Tipo de Expediente *</Label>
                  <Select value={tipoExpediente} onValueChange={(value) => setTipoExpediente(value as DossierType)}>
                    <SelectTrigger id="tipo-expediente">
                      <SelectValue placeholder="Seleccione el tipo de expediente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDossierTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {DOSSIER_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Los tipos disponibles dependen de su rol en el sistema
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expediente">Número de Expediente *</Label>
                  <Input
                    id="expediente"
                    placeholder="Ej: CLI-2024-001"
                    value={expediente}
                    onChange={(e) => setExpediente(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingrese el número de expediente al que pertenece este documento
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-documento">Tipo de Documento *</Label>
                  <Select value={tipoDocumento} onValueChange={(value) => setTipoDocumento(value as DocumentType)}>
                    <SelectTrigger id="tipo-documento">
                      <SelectValue placeholder="Seleccione el tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="archivo">Archivo del Documento *</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="archivo"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      required
                    />
                    {archivo && (
                      <div className="flex items-center gap-2 text-sm text-success p-2 rounded-lg bg-success/10">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{archivo.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceptados: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha-vencimiento">Fecha de Vencimiento {requiereVencimiento && "*"}</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fecha-vencimiento"
                      type="date"
                      value={fechaVencimiento}
                      onChange={(e) => setFechaVencimiento(e.target.value)}
                      className="pl-9"
                      required={requiereVencimiento}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  {!requiereVencimiento && tipoDocumento && (
                    <p className="text-xs text-info">Este tipo de documento no requiere fecha de vencimiento</p>
                  )}
                  {requiereVencimiento && (
                    <p className="text-xs text-muted-foreground">
                      La fecha de vencimiento es obligatoria para este tipo de documento
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Ingrese cualquier observación relevante sobre este documento..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Información adicional que considere relevante para la revisión del documento
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Cargando..." : "Guardar Documento"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/documentos/lista">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 rounded-lg bg-muted">
            <h3 className="font-semibold mb-2 text-sm">Reglas Funcionales</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Los documentos con fecha de vencimiento obligatoria no se pueden cargar sin ella</li>
              <li>• Cada carga genera un registro automático en la auditoría del sistema</li>
              <li>• El documento queda en estado "Pendiente de aprobación" hasta revisión de Cumplimiento</li>
              <li>• Los documentos no se pueden eliminar, solo se pueden cargar nuevas versiones</li>
              <li>• Se genera una alerta automática para la Unidad de Cumplimiento</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
