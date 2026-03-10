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

export default function CargaDocumentoPage() {
  const { toast } = useToast()
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [tipoExpediente, setTipoExpediente] = useState("")
  const [expediente, setExpediente] = useState("")
  const [fechaVencimiento, setFechaVencimiento] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tipoDocumento || !expediente || !archivo) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (!fechaVencimiento && tipoDocumento !== "acta_constitutiva") {
      toast({
        title: "Error de validación",
        description: "La fecha de vencimiento es obligatoria para este tipo de documento",
        variant: "destructive",
      })
      return
    }

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

  const requiereVencimiento = tipoDocumento !== "" && tipoDocumento !== "acta_constitutiva"

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
                  <Select value={tipoExpediente} onValueChange={setTipoExpediente}>
                    <SelectTrigger id="tipo-expediente">
                      <SelectValue placeholder="Seleccione el tipo de expediente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="intermediario">Intermediario</SelectItem>
                      <SelectItem value="proveedor">Proveedor</SelectItem>
                      <SelectItem value="empleado">Empleado</SelectItem>
                      <SelectItem value="reasegurador">Reasegurador</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                    <SelectTrigger id="tipo-documento">
                      <SelectValue placeholder="Seleccione el tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rif">RIF</SelectItem>
                      <SelectItem value="cedula">Cédula de Identidad</SelectItem>
                      <SelectItem value="acta_constitutiva">Acta Constitutiva</SelectItem>
                      <SelectItem value="estados_financieros">Estados Financieros</SelectItem>
                      <SelectItem value="licencia_sudeaseg">Licencia SUDEASEG</SelectItem>
                      <SelectItem value="certificado_bancario">Certificado Bancario</SelectItem>
                      <SelectItem value="comprobante_domicilio">Comprobante de Domicilio</SelectItem>
                      <SelectItem value="contrato_reaseguro">Contrato de Reaseguro</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="archivo">Archivo del Documento *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="archivo"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                      required
                    />
                    {archivo && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <FileText className="h-4 w-4" />
                        {archivo.name}
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
                  <Button type="submit" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Guardar Documento
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/">Cancelar</Link>
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
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
