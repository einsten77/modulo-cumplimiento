"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Shield, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function PepEnhancedMeasuresPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pepId = searchParams.get("id")
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [pepDeclaration, setPepDeclaration] = useState<any>(null)
  const [measures, setMeasures] = useState<any>(null)

  // Form state
  const [complianceApproval, setComplianceApproval] = useState(false)
  const [enhancedFunds, setEnhancedFunds] = useState(false)
  const [fundsDetails, setFundsDetails] = useState("")
  const [expandedScreening, setExpandedScreening] = useState(false)
  const [screeningFrequency, setScreeningFrequency] = useState("MONTHLY")
  const [intensifiedMonitoring, setIntensifiedMonitoring] = useState(false)
  const [monitoringDetails, setMonitoringDetails] = useState("")
  const [additionalDocs, setAdditionalDocs] = useState(false)
  const [docsList, setDocsList] = useState("")
  const [periodicUpdate, setPeriodicUpdate] = useState(false)
  const [updateFrequency, setUpdateFrequency] = useState("BIANNUAL")
  const [justification, setJustification] = useState("")

  const canApprove = user?.role === "OFICIAL_CUMPLIMIENTO"

  useEffect(() => {
    if (pepId) {
      fetchPepData()
      fetchMeasures()
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

  const fetchMeasures = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/declarations/${pepId}/enhanced-measures`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      if (response.ok) {
        const data = await response.json()
        setMeasures(data)
        // Populate form if measures exist
        if (data) {
          setComplianceApproval(data.complianceOfficerApproval)
          setEnhancedFunds(data.enhancedFundsOrigin)
          setFundsDetails(data.fundsOriginDetails || "")
          setExpandedScreening(data.expandedScreening)
          setScreeningFrequency(data.screeningFrequency || "MONTHLY")
          setIntensifiedMonitoring(data.intensifiedMonitoring)
          setMonitoringDetails(data.monitoringDetails || "")
          setAdditionalDocs(data.additionalDocumentation)
          setDocsList(data.documentationList?.join(", ") || "")
          setPeriodicUpdate(data.periodicUpdate)
          setUpdateFrequency(data.updateFrequency || "BIANNUAL")
          setJustification(data.justification || "")
        }
      }
    } catch (error) {
      console.error("Error fetching measures:", error)
    }
  }

  const handleSave = async () => {
    if (!justification) {
      toast({
        title: "Justificación requerida",
        description: "Debe proporcionar una justificación para las medidas aplicadas",
        variant: "destructive",
      })
      return
    }

    if (!canApprove && complianceApproval) {
      toast({
        title: "Permisos insuficientes",
        description: "Solo el Oficial de Cumplimiento puede aprobar medidas reforzadas",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const measuresData = {
        pepDeclarationId: pepId,
        complianceOfficerApproval: canApprove ? complianceApproval : false,
        complianceOfficerName: canApprove && complianceApproval ? user?.name : null,
        enhancedFundsOrigin: enhancedFunds,
        fundsOriginDetails: fundsDetails,
        expandedScreening,
        screeningFrequency,
        intensifiedMonitoring,
        monitoringDetails,
        additionalDocumentation: additionalDocs,
        documentationList: docsList
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d),
        periodicUpdate,
        updateFrequency,
        justification,
      }

      const url = measures
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/enhanced-measures/${measures.id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pep/enhanced-measures`

      const method = measures ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(measuresData),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast({
        title: "Medidas reforzadas guardadas",
        description:
          canApprove && complianceApproval
            ? "Las medidas han sido aprobadas y activadas"
            : "Las medidas han sido registradas y están pendientes de aprobación",
      })

      router.push(`/pep/seguimiento?id=${pepId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las medidas reforzadas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <Link href={`/pep/familiares?id=${pepId}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Familiares y Asociados
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Medidas de Debida Diligencia Reforzada
          </h2>
          <p className="text-muted-foreground">
            Controles adicionales obligatorios para clientes PEP según normativa GAFI
          </p>
        </div>

        {pepDeclaration && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg text-foreground">Cliente PEP - Medidas Reforzadas Requeridas</CardTitle>
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Checklist de Medidas Reforzadas
                </CardTitle>
                <CardDescription>Controles obligatorios para clientes PEP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Approval */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="approval"
                    checked={complianceApproval}
                    onCheckedChange={(checked) => setComplianceApproval(checked as boolean)}
                    disabled={!canApprove}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor="approval"
                      className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aprobación por Oficial de Cumplimiento *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Autorización formal del Oficial de Cumplimiento para establecer o mantener la relación comercial
                    </p>
                    {!canApprove && (
                      <Badge variant="secondary" className="mt-2">
                        Solo Oficial de Cumplimiento puede aprobar
                      </Badge>
                    )}
                    {complianceApproval && canApprove && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Aprobado por: </span>
                        <span className="font-medium">{user?.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Funds Origin */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="funds"
                      checked={enhancedFunds}
                      onCheckedChange={(checked) => setEnhancedFunds(checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="funds" className="text-base font-medium leading-none">
                        Verificación Reforzada de Origen de Fondos *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Documentación exhaustiva y verificación independiente del origen de los fondos y patrimonio
                      </p>
                    </div>
                  </div>
                  {enhancedFunds && (
                    <div className="ml-11 space-y-2">
                      <Label htmlFor="funds-details">Detalles de Verificación</Label>
                      <Textarea
                        id="funds-details"
                        value={fundsDetails}
                        onChange={(e) => setFundsDetails(e.target.value)}
                        placeholder="Describa los documentos solicitados, fuentes verificadas y resultado de la verificación..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Expanded Screening */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="screening"
                      checked={expandedScreening}
                      onCheckedChange={(checked) => setExpandedScreening(checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="screening" className="text-base font-medium leading-none">
                        Screening Ampliado y Periódico *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Verificación mensual contra listas internacionales y monitoreo de medios
                      </p>
                    </div>
                  </div>
                  {expandedScreening && (
                    <div className="ml-11 space-y-2">
                      <Label htmlFor="screening-freq">Frecuencia de Screening</Label>
                      <Select value={screeningFrequency} onValueChange={setScreeningFrequency}>
                        <SelectTrigger id="screening-freq">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Mensual</SelectItem>
                          <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                          <SelectItem value="BIANNUAL">Semestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Intensified Monitoring */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="monitoring"
                      checked={intensifiedMonitoring}
                      onCheckedChange={(checked) => setIntensifiedMonitoring(checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="monitoring" className="text-base font-medium leading-none">
                        Monitoreo Continuo Intensificado *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Revisión continua de transacciones y detección de operaciones inusuales o atípicas
                      </p>
                    </div>
                  </div>
                  {intensifiedMonitoring && (
                    <div className="ml-11 space-y-2">
                      <Label htmlFor="monitoring-details">Detalles del Monitoreo</Label>
                      <Textarea
                        id="monitoring-details"
                        value={monitoringDetails}
                        onChange={(e) => setMonitoringDetails(e.target.value)}
                        placeholder="Describa los controles de monitoreo, umbrales de alerta y procedimientos de revisión..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Additional Documentation */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="docs"
                      checked={additionalDocs}
                      onCheckedChange={(checked) => setAdditionalDocs(checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="docs" className="text-base font-medium leading-none">
                        Documentación Adicional Obligatoria
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Documentos suplementarios requeridos para la debida diligencia reforzada
                      </p>
                    </div>
                  </div>
                  {additionalDocs && (
                    <div className="ml-11 space-y-2">
                      <Label htmlFor="docs-list">Lista de Documentos Requeridos</Label>
                      <Textarea
                        id="docs-list"
                        value={docsList}
                        onChange={(e) => setDocsList(e.target.value)}
                        placeholder="Declaración jurada de origen de fondos, Estados financieros, Declaración de patrimonio, etc. (separados por comas)"
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Periodic Update */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="update"
                      checked={periodicUpdate}
                      onCheckedChange={(checked) => setPeriodicUpdate(checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="update" className="text-base font-medium leading-none">
                        Actualización Periódica Reforzada *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Actualización más frecuente de información del cliente (semestral vs anual estándar)
                      </p>
                    </div>
                  </div>
                  {periodicUpdate && (
                    <div className="ml-11 space-y-2">
                      <Label htmlFor="update-freq">Frecuencia de Actualización</Label>
                      <Select value={updateFrequency} onValueChange={setUpdateFrequency}>
                        <SelectTrigger id="update-freq">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                          <SelectItem value="BIANNUAL">Semestral</SelectItem>
                          <SelectItem value="ANNUAL">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Justificación de Medidas Aplicadas</CardTitle>
                <CardDescription>Fundamento técnico y normativo obligatorio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="justification">Justificación Técnica *</Label>
                  <Textarea
                    id="justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Documente las razones técnicas y normativas para las medidas reforzadas seleccionadas, incluyendo evaluación de riesgo, consideraciones regulatorias y criterios GAFI aplicables..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta justificación es obligatoria y forma parte del expediente permanente para auditoría e
                    inspección de SUDEASEG
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href={`/pep/familiares?id=${pepId}`}>Cancelar</Link>
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Medidas Reforzadas"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Estado de Medidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aprobación OC:</span>
                  <Badge variant={complianceApproval ? "default" : "secondary"}>
                    {complianceApproval ? "Aprobado" : "Pendiente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Medidas activas:</span>
                  <span className="text-sm font-medium">
                    {
                      [enhancedFunds, expandedScreening, intensifiedMonitoring, additionalDocs, periodicUpdate].filter(
                        Boolean,
                      ).length
                    }{" "}
                    de 5
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usuario:</span>
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rol:</span>
                  <Badge variant="default">{user?.role}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Marco Normativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Recomendación GAFI 12:</p>
                <p>
                  Las instituciones financieras deberán aplicar medidas de debida diligencia reforzada (DDR) a las
                  relaciones comerciales con personas expuestas políticamente.
                </p>
                <p className="font-medium text-foreground mt-3">Elementos de DDR:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Aprobación de la alta gerencia</li>
                  <li>Medidas razonables para establecer el origen de los fondos y el patrimonio</li>
                  <li>Monitoreo continuo intensificado de la relación comercial</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Impacto en Riesgo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Las medidas reforzadas son obligatorias para clientes PEP y no reducen el nivel de riesgo inherente,
                  pero constituyen controles de mitigación necesarios para la gestión adecuada del riesgo.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Riesgo inherente:</span>
                  <Badge className="bg-destructive text-destructive-foreground">Alto</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Controles DDR:</span>
                  <Badge variant="default">Reforzados</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
