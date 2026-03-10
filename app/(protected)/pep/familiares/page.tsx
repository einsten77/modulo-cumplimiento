"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Plus, Edit2, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { PepRelative } from "@/types/pep"

export default function PepRelativesPage() {
  const searchParams = useSearchParams()
  const pepId = searchParams.get("id")
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [relatives, setRelatives] = useState<PepRelative[]>([])
  const [pepDeclaration, setPepDeclaration] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRelative, setEditingRelative] = useState<PepRelative | null>(null)

  // Form state
  const [fullName, setFullName] = useState("")
  const [documentId, setDocumentId] = useState("")
  const [nationality, setNationality] = useState("")
  const [relationshipType, setRelationshipType] = useState("")
  const [pepPosition, setPepPosition] = useState("")
  const [pepInstitution, setPepInstitution] = useState("")
  const [observations, setObservations] = useState("")

  const canModify = user?.role === "OFICIAL_CUMPLIMIENTO" || user?.role === "UNIDAD_CUMPLIMIENTO"

  useEffect(() => {
    if (pepId) {
      fetchPepData()
      fetchRelatives()
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

  const fetchRelatives = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/declarations/${pepId}/relatives`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setRelatives(data)
      }
    } catch (error) {
      console.error("Error fetching relatives:", error)
    }
  }

  const handleSaveRelative = async () => {
    if (!fullName || !documentId || !relationshipType) {
      toast({
        title: "Campos requeridos",
        description: "Complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const relativeData = {
        pepDeclarationId: pepId,
        fullName,
        documentId,
        nationality,
        relationshipType,
        pepPosition,
        pepInstitution,
        observations,
        evaluationStatus: "PENDING",
      }

      const url = editingRelative
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/relatives/${editingRelative.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/relatives`

      const method = editingRelative ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(relativeData),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast({
        title: editingRelative ? "Familiar actualizado" : "Familiar agregado",
        description: "La información ha sido guardada correctamente",
      })

      setDialogOpen(false)
      resetForm()
      fetchRelatives()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la información",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFullName("")
    setDocumentId("")
    setNationality("")
    setRelationshipType("")
    setPepPosition("")
    setPepInstitution("")
    setObservations("")
    setEditingRelative(null)
  }

  const handleEdit = (relative: PepRelative) => {
    setEditingRelative(relative)
    setFullName(relative.fullName)
    setDocumentId(relative.documentId)
    setNationality(relative.nationality)
    setRelationshipType(relative.relationshipType)
    setPepPosition(relative.pepPosition || "")
    setPepInstitution(relative.pepInstitution || "")
    setObservations(relative.observations || "")
    setDialogOpen(true)
  }

  const getRelationshipLabel = (type: string) => {
    const labels: Record<string, string> = {
      SPOUSE: "Cónyuge",
      FIRST_DEGREE: "Familiar de primer grado",
      SECOND_DEGREE: "Familiar de segundo grado",
      BUSINESS_PARTNER: "Socio comercial",
      CLOSE_ASSOCIATE: "Asociado cercano",
    }
    return labels[type] || type
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: { label: "Pendiente", className: "bg-warning text-warning-foreground" },
      IN_REVIEW: { label: "En Revisión", className: "bg-info text-info-foreground" },
      EVALUATED: { label: "Evaluado", className: "bg-success text-success-foreground" },
    }
    const config = variants[status] || { label: status, className: "" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Gestión PEP</h1>
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
          <Link href={`/pep/identificacion?id=${pepId}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Identificación PEP
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Familiares y Asociados Cercanos
          </h2>
          <p className="text-muted-foreground">
            Registro de personas relacionadas que requieren evaluación por vínculo con PEP
          </p>
        </div>

        {pepDeclaration && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg text-foreground">Cliente PEP Identificado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Expediente: </span>
                  <span className="font-medium">{pepDeclaration.dossierNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cliente: </span>
                  <span className="font-medium">{pepDeclaration.clientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Condición: </span>
                  <Badge className="bg-warning text-warning-foreground">{pepDeclaration.pepCondition}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Familiares y Asociados</CardTitle>
                <CardDescription>Personas vinculadas que requieren evaluación de riesgo</CardDescription>
              </div>
              {canModify && (
                <Dialog
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Familiar/Asociado
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingRelative ? "Editar" : "Agregar"} Familiar o Asociado Cercano</DialogTitle>
                      <DialogDescription>
                        Complete la información de la persona relacionada con el PEP
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Nombre Completo *</Label>
                        <Input
                          id="full-name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nombre completo de la persona"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="document-id">Documento de Identidad *</Label>
                          <Input
                            id="document-id"
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value)}
                            placeholder="V-12.345.678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nationality">Nacionalidad</Label>
                          <Input
                            id="nationality"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            placeholder="Venezolana"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="relationship">Tipo de Relación *</Label>
                        <Select value={relationshipType} onValueChange={setRelationshipType}>
                          <SelectTrigger id="relationship">
                            <SelectValue placeholder="Seleccione el tipo de relación..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SPOUSE">Cónyuge</SelectItem>
                            <SelectItem value="FIRST_DEGREE">Familiar de primer grado</SelectItem>
                            <SelectItem value="SECOND_DEGREE">Familiar de segundo grado</SelectItem>
                            <SelectItem value="BUSINESS_PARTNER">Socio comercial conocido</SelectItem>
                            <SelectItem value="CLOSE_ASSOCIATE">Asociado cercano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="pep-position">Cargo PEP (si aplica)</Label>
                          <Input
                            id="pep-position"
                            value={pepPosition}
                            onChange={(e) => setPepPosition(e.target.value)}
                            placeholder="Solo si esta persona también es PEP"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pep-institution">Institución (si aplica)</Label>
                          <Input
                            id="pep-institution"
                            value={pepInstitution}
                            onChange={(e) => setPepInstitution(e.target.value)}
                            placeholder="Organismo o entidad"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="observations">Observaciones</Label>
                        <Textarea
                          id="observations"
                          value={observations}
                          onChange={(e) => setObservations(e.target.value)}
                          placeholder="Información adicional relevante sobre el vínculo o la persona..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false)
                          resetForm()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveRelative} disabled={loading}>
                        {loading ? "Guardando..." : editingRelative ? "Actualizar" : "Guardar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {relatives.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No se han registrado familiares o asociados cercanos</p>
                {canModify && (
                  <Button variant="outline" onClick={() => setDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar el primer registro
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo de Relación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    {canModify && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatives.map((relative) => (
                    <TableRow key={relative.id}>
                      <TableCell className="font-medium">{relative.fullName}</TableCell>
                      <TableCell>{relative.documentId}</TableCell>
                      <TableCell>{getRelationshipLabel(relative.relationshipType)}</TableCell>
                      <TableCell>{getStatusBadge(relative.evaluationStatus)}</TableCell>
                      <TableCell>{new Date(relative.createdAt).toLocaleDateString()}</TableCell>
                      {canModify && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(relative)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Requisitos Normativos:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Identificación de familiares directos según definición GAFI (cónyuge, hijos, padres)</li>
              <li>Identificación de asociados cercanos con vínculos comerciales relevantes</li>
              <li>Evaluación de riesgo individual para cada persona relacionada</li>
              <li>Aplicación de debida diligencia proporcional al tipo de vínculo</li>
              <li>Actualización periódica de la información de familiares y asociados</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
