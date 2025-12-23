"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Save, Send, FileText, Building2, User, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateDossierForm() {
  const router = useRouter()
  const [selectedType, setSelectedType] = React.useState<string>("")
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [completeness, setCompleteness] = React.useState(0)

  // Simular roles del usuario (en producción vendría del contexto de autenticación)
  const userRole = "COMMERCIAL" // COMMERCIAL, ADMINISTRATION, HR, OPERATIONS, TECHNICAL, COMPLIANCE_OFFICER

  // Determinar qué tipos de expediente puede crear según rol
  const getAuthorizedDossierTypes = () => {
    const typesByRole: Record<string, string[]> = {
      COMMERCIAL: ["CLIENT", "INTERMEDIARY"],
      ADMINISTRATION: ["PROVIDER"],
      HR: ["EMPLOYEE"],
      OPERATIONS: ["INTERMEDIARY", "PROVIDER", "REINSURER"],
      TECHNICAL: ["REINSURER", "RETROCESSIONAIRE"],
      COMPLIANCE_OFFICER: ["CLIENT", "INTERMEDIARY", "EMPLOYEE", "PROVIDER", "REINSURER", "RETROCESSIONAIRE"],
    }

    return typesByRole[userRole] || []
  }

  const authorizedTypes = getAuthorizedDossierTypes()

  const dossierTypes = [
    {
      value: "CLIENT",
      label: "Cliente",
      icon: User,
      description: "Personas naturales o jurídicas que contratan seguros",
    },
    { value: "INTERMEDIARY", label: "Intermediario", icon: Users, description: "Corredores y productores de seguros" },
    { value: "EMPLOYEE", label: "Empleado", icon: User, description: "Personal interno de la empresa" },
    { value: "PROVIDER", label: "Proveedor", icon: Building2, description: "Proveedores de bienes y servicios" },
    { value: "REINSURER", label: "Reasegurador", icon: Building2, description: "Empresas de reaseguro" },
    { value: "RETROCESSIONAIRE", label: "Retrocesionario", icon: Building2, description: "Empresas de retrocesión" },
  ]

  const getMandatoryFields = (type: string) => {
    const fieldsByType: Record<string, string[]> = {
      CLIENT: ["fullName", "documentType", "documentNumber", "email", "phone", "address", "economicActivity"],
      INTERMEDIARY: ["legalName", "rifNumber", "email", "phone", "address", "licenseNumber"],
      EMPLOYEE: ["fullName", "documentNumber", "email", "phone", "position", "department"],
      PROVIDER: ["legalName", "rifNumber", "email", "phone", "address", "serviceType"],
      REINSURER: ["legalName", "country", "email", "phone", "licenseNumber"],
      RETROCESSIONAIRE: ["legalName", "country", "email", "contractNumber"],
    }
    return fieldsByType[type] || []
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Calcular completitud
    if (selectedType) {
      const mandatory = getMandatoryFields(selectedType)
      const completed = mandatory.filter((f) => formData[f] || f === field).length
      const percentage = Math.round((completed / mandatory.length) * 100)
      setCompleteness(percentage)
    }
  }

  const handleSaveDraft = async () => {
    console.log("[v0] Guardando borrador:", { selectedType, formData, status: "INCOMPLETE" })
    // API call to save draft
    alert("Borrador guardado exitosamente")
  }

  const handleSubmitToCompliance = async () => {
    if (completeness < 76) {
      alert("El expediente debe tener al menos 76% de completitud para enviar a cumplimiento")
      return
    }

    console.log("[v0] Enviando a cumplimiento:", { selectedType, formData, status: "UNDER_REVIEW" })
    // API call to submit to compliance
    router.push("/dossiers")
  }

  return (
    <div className="space-y-6">
      {/* Role-based authorization notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Tu rol <strong>{userRole}</strong> te autoriza a crear expedientes de tipo:{" "}
          {authorizedTypes.map((t) => dossierTypes.find((dt) => dt.value === t)?.label).join(", ")}
        </AlertDescription>
      </Alert>

      {/* Step 1: Select Dossier Type */}
      <Card>
        <CardHeader>
          <CardTitle>Paso 1: Seleccione el Tipo de Expediente</CardTitle>
          <CardDescription>Elija el tipo de sujeto para el cual creará el expediente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {dossierTypes
              .filter((type) => authorizedTypes.includes(type.value))
              .map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                      selectedType === type.value ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-semibold">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </button>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Fill Information */}
      {selectedType && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Paso 2: Complete la Información</CardTitle>
                  <CardDescription>
                    Rellene los campos requeridos. Puede guardar borradores y completar después.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Completitud:</span>
                  <Badge variant={completeness >= 76 ? "default" : "secondary"} className="text-base">
                    {completeness}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="identification" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="identification">Identificación</TabsTrigger>
                  <TabsTrigger value="contact">Contacto</TabsTrigger>
                  <TabsTrigger value="economic">Información Económica</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="identification" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedType === "CLIENT" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fullName">
                            Nombre Completo <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="fullName"
                            placeholder="Ingrese nombre completo"
                            value={formData.fullName || ""}
                            onChange={(e) => handleFieldChange("fullName", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="documentType">
                            Tipo de Documento <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.documentType}
                            onValueChange={(value) => handleFieldChange("documentType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="V">Cédula V-</SelectItem>
                              <SelectItem value="E">Cédula E-</SelectItem>
                              <SelectItem value="J">RIF J-</SelectItem>
                              <SelectItem value="G">RIF G-</SelectItem>
                              <SelectItem value="P">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="documentNumber">
                            Número de Documento <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="documentNumber"
                            placeholder="12345678"
                            value={formData.documentNumber || ""}
                            onChange={(e) => handleFieldChange("documentNumber", e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {selectedType === "INTERMEDIARY" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="legalName">
                            Razón Social <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="legalName"
                            placeholder="Nombre de la empresa"
                            value={formData.legalName || ""}
                            onChange={(e) => handleFieldChange("legalName", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rifNumber">
                            Número de RIF <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="rifNumber"
                            placeholder="J-12345678-9"
                            value={formData.rifNumber || ""}
                            onChange={(e) => handleFieldChange("rifNumber", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">
                            Número de Licencia <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="licenseNumber"
                            placeholder="Licencia SUDEASEG"
                            value={formData.licenseNumber || ""}
                            onChange={(e) => handleFieldChange("licenseNumber", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Correo Electrónico <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email || ""}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Teléfono <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="+58 412 1234567"
                        value={formData.phone || ""}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">
                        Dirección <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="address"
                        placeholder="Dirección completa"
                        value={formData.address || ""}
                        onChange={(e) => handleFieldChange("address", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="economic" className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="economicActivity">
                        Actividad Económica <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.economicActivity}
                        onValueChange={(value) => handleFieldChange("economicActivity", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AGRICULTURE">Agricultura</SelectItem>
                          <SelectItem value="COMMERCE">Comercio</SelectItem>
                          <SelectItem value="CONSTRUCTION">Construcción</SelectItem>
                          <SelectItem value="SERVICES">Servicios</SelectItem>
                          <SelectItem value="INDUSTRY">Industria</SelectItem>
                          <SelectItem value="FINANCE">Finanzas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Ingresos Mensuales Estimados</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        placeholder="0.00"
                        value={formData.monthlyIncome || ""}
                        onChange={(e) => handleFieldChange("monthlyIncome", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="fundsOrigin">Origen de Fondos</Label>
                      <Textarea
                        id="fundsOrigin"
                        placeholder="Describa el origen de los fondos"
                        value={formData.fundsOrigin || ""}
                        onChange={(e) => handleFieldChange("fundsOrigin", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4 pt-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Los documentos pueden adjuntarse después de crear el expediente. El sistema indicará cuáles son
                      obligatorios según el tipo de sujeto.
                    </AlertDescription>
                  </Alert>
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      La carga de documentos estará disponible después de crear el expediente
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Estado inicial: <Badge variant="secondary">INCOMPLETO</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveDraft}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Borrador
                  </Button>
                  <Button onClick={handleSubmitToCompliance} disabled={completeness < 76}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar a Cumplimiento
                  </Button>
                </div>
              </div>
              {completeness < 76 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se requiere al menos 76% de completitud para enviar a revisión de cumplimiento. Actual:{" "}
                    {completeness}%
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
