"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, FileSearch, AlertCircle, Loader2 } from "lucide-react"
import type { ScreeningList, EntityType } from "@/types/screening"

const LISTAS_SCREENING = [
  { id: "ONU", name: "Lista Consolidada ONU", description: "Consejo de Seguridad de la ONU" },
  { id: "OFAC", name: "Lista OFAC", description: "Office of Foreign Assets Control - EEUU" },
  { id: "UE", name: "Listas Unión Europea", description: "Sanciones restrictivas UE" },
  { id: "UNIF", name: "Listas UNIF", description: "Unidad Nacional de Inteligencia Financiera" },
  { id: "GAFI", name: "Listas GAFI", description: "Grupo de Acción Financiera Internacional" },
]

export default function EjecutarScreeningPage() {
  const router = useRouter()
  const { user, checkPermission } = useAuth()

  // Form state
  const [dossierId, setDossierId] = useState("")
  const [entityType, setEntityType] = useState<EntityType>("NATURAL")
  const [fullName, setFullName] = useState("")
  const [documentType, setDocumentType] = useState("V")
  const [documentNumber, setDocumentNumber] = useState("")
  const [selectedLists, setSelectedLists] = useState<ScreeningList[]>(["ONU", "OFAC", "UE", "UNIF", "GAFI"])

  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canExecute = checkPermission("screening:execute")

  const handleListToggle = (listId: ScreeningList) => {
    setSelectedLists((prev) => (prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]))
  }

  const validateForm = (): boolean => {
    if (!dossierId.trim()) {
      setError("Debe especificar un expediente")
      return false
    }
    if (!fullName.trim()) {
      setError("Debe ingresar el nombre completo o razón social")
      return false
    }
    if (!documentNumber.trim()) {
      setError("Debe ingresar el número de documento")
      return false
    }
    if (selectedLists.length === 0) {
      setError("Debe seleccionar al menos una lista para consultar")
      return false
    }
    return true
  }

  const handleExecuteScreening = async () => {
    if (!validateForm() || !user) return

    setIsExecuting(true)
    setError(null)

    try {
      const request = {
        dossierId,
        subject: {
          fullName,
          documentType,
          documentNumber,
          entityType,
        },
        selectedLists,
        executedByUserId: user.id,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/screening/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error("Error al ejecutar el screening")
      }

      const data = await response.json()
      router.push(`/screening/resultados?screeningId=${data.screeningId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsExecuting(false)
    }
  }

  if (!canExecute) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tiene permisos para ejecutar screenings. Contacte a la Unidad de Cumplimiento.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-semibold text-foreground">Ejecutar Screening</h1>
          </div>
          <p className="text-muted-foreground">Consulta contra listas restrictivas nacionales e internacionales</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-info/50 bg-info/10">
        <AlertCircle className="h-4 w-4 text-info" />
        <AlertTitle className="text-info-foreground">Screening Automatizado</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          El sistema utiliza el algoritmo Jaro-Winkler para calcular el porcentaje de similitud. Todas las consultas
          quedan registradas para auditoría de SUDEASEG.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Datos del Sujeto a Evaluar
          </CardTitle>
          <CardDescription>
            Ingrese los datos de la persona natural o jurídica para realizar el screening
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expediente">Expediente Asociado *</Label>
                <Input
                  id="expediente"
                  placeholder="EXP-2024-001234"
                  className="font-mono"
                  value={dossierId}
                  onChange={(e) => setDossierId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Número del expediente en SIAR</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo-persona">Tipo de Persona *</Label>
                <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                  <SelectTrigger id="tipo-persona">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NATURAL">Persona Natural</SelectItem>
                    <SelectItem value="JURIDICA">Persona Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre-completo">Nombre Completo / Razón Social *</Label>
              <Input
                id="nombre-completo"
                placeholder="Ingrese el nombre completo o razón social"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ingrese el nombre exacto como aparece en los documentos de identidad
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo-documento">Tipo de Documento *</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="tipo-documento">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V">V - Cédula de Identidad</SelectItem>
                    <SelectItem value="E">E - Cédula de Extranjero</SelectItem>
                    <SelectItem value="J">J - Registro Mercantil</SelectItem>
                    <SelectItem value="G">G - Gobierno</SelectItem>
                    <SelectItem value="P">P - Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero-documento">Número de Documento *</Label>
                <Input
                  id="numero-documento"
                  placeholder="12345678"
                  className="font-mono"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Seleccionar Listas a Consultar</h3>
            <div className="space-y-3">
              {LISTAS_SCREENING.map((lista) => (
                <div
                  key={lista.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={lista.id}
                    checked={selectedLists.includes(lista.id as ScreeningList)}
                    onCheckedChange={() => handleListToggle(lista.id as ScreeningList)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={lista.id} className="cursor-pointer font-medium">
                      {lista.name}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">{lista.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Listas seleccionadas: {selectedLists.length}/5</p>
              <p>El screening puede tardar entre 10 y 30 segundos</p>
            </div>
            <Button size="lg" onClick={handleExecuteScreening} disabled={isExecuting}>
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Ejecutar Screening
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-warning-foreground">
            <AlertCircle className="h-4 w-4 text-warning" />
            Importante - Consideraciones de Cumplimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Todas las consultas quedan registradas con fecha, hora y usuario.</p>
          <p>• El resultado del screening no implica aprobación o rechazo automático.</p>
          <p>• Las coincidencias deben ser analizadas por el Oficial de Cumplimiento.</p>
          <p>• El sistema genera alertas automáticas para coincidencias de nivel Alto.</p>
        </CardContent>
      </Card>
    </div>
  )
}
