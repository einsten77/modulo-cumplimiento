"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, AlertTriangle, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function PepIdentificationPage() {
  const [condicionPep, setCondicionPep] = useState("")
  const [showWarning, setShowWarning] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/seguros-20la-20occidental-20-20241004-120655-0000-20-281-29.jpg"
                alt="La Occidental"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  SIAR - Gestión de Personas Expuestas Políticamente
                </h1>
                <p className="text-sm text-muted-foreground">C.A. de Seguros la Occidental - Regulado por SUDEASEG</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Oficial de Cumplimiento</p>
              <p className="text-xs text-muted-foreground">María González</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Identificación de Persona Expuesta Políticamente (PEP)
          </h2>
          <p className="text-muted-foreground">
            Declaración de condición PEP según estándares GAFI y normativa SUDEASEG
          </p>
        </div>

        {showWarning && (
          <Card className="mb-6 border-warning bg-warning/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg text-foreground">Alerta de Cumplimiento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                La declaración de condición PEP requiere aprobación del Oficial de Cumplimiento y genera automáticamente
                requisitos de debida diligencia reforzada según política institucional.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos del Expediente</CardTitle>
                <CardDescription>Información del cliente o vinculado a evaluar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expediente">Número de Expediente</Label>
                    <Input id="expediente" value="EXP-2024-001234" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo-persona">Tipo de Persona</Label>
                    <Input id="tipo-persona" value="Natural" disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo / Razón Social</Label>
                  <Input id="nombre" value="Carlos Alberto Rodríguez Pérez" disabled className="font-medium" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="documento">Documento de Identidad</Label>
                    <Input id="documento" value="V-12.345.678" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nacionalidad">Nacionalidad</Label>
                    <Input id="nacionalidad" value="Venezolana" disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Declaración de Condición PEP</CardTitle>
                <CardDescription>Seleccione la condición aplicable según evaluación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="condicion-pep">Condición PEP *</Label>
                  <Select
                    value={condicionPep}
                    onValueChange={(value) => {
                      setCondicionPep(value)
                      setShowWarning(value !== "no-pep")
                    }}
                  >
                    <SelectTrigger id="condicion-pep">
                      <SelectValue placeholder="Seleccione la condición..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-pep">No PEP</SelectItem>
                      <SelectItem value="pep-actual">PEP Actual</SelectItem>
                      <SelectItem value="ex-pep">Ex PEP (histórico)</SelectItem>
                      <SelectItem value="pep-vinculado">Familiar o Relacionado de PEP</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    PEP: Persona que desempeña o ha desempeñado funciones públicas prominentes
                  </p>
                </div>

                {condicionPep !== "no-pep" && condicionPep !== "" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="tipo-pep">Tipo de PEP *</Label>
                      <Select>
                        <SelectTrigger id="tipo-pep">
                          <SelectValue placeholder="Seleccione el tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nacional">PEP Nacional</SelectItem>
                          <SelectItem value="extranjero">PEP Extranjero</SelectItem>
                          <SelectItem value="internacional">PEP de Organismo Internacional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pais">País *</Label>
                      <Select>
                        <SelectTrigger id="pais">
                          <SelectValue placeholder="Seleccione el país..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VE">Venezuela</SelectItem>
                          <SelectItem value="CO">Colombia</SelectItem>
                          <SelectItem value="BR">Brasil</SelectItem>
                          <SelectItem value="US">Estados Unidos</SelectItem>
                          <SelectItem value="ES">España</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {condicionPep === "pep-vinculado" && (
                      <div className="space-y-2">
                        <Label htmlFor="tipo-vinculo">Tipo de Vínculo *</Label>
                        <Select>
                          <SelectTrigger id="tipo-vinculo">
                            <SelectValue placeholder="Seleccione el tipo de vínculo..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conyuge">Cónyuge</SelectItem>
                            <SelectItem value="familiar-1">Familiar de primer grado</SelectItem>
                            <SelectItem value="familiar-2">Familiar de segundo grado</SelectItem>
                            <SelectItem value="socio">Socio comercial conocido</SelectItem>
                            <SelectItem value="relacionado">Relacionado estrecho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="fuente-info">Fuente de Información *</Label>
                      <Select>
                        <SelectTrigger id="fuente-info">
                          <SelectValue placeholder="Seleccione la fuente..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="autodeclaracion">Autodeclaración del cliente</SelectItem>
                          <SelectItem value="documentos">Documentos aportados</SelectItem>
                          <SelectItem value="medios">Medios de comunicación</SelectItem>
                          <SelectItem value="registros">Registros públicos oficiales</SelectItem>
                          <SelectItem value="screening">Resultado de Screening</SelectItem>
                          <SelectItem value="investigacion">Investigación interna</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observaciones">Observaciones y Justificación *</Label>
                      <Textarea
                        id="observaciones"
                        placeholder="Documente la base de la declaración PEP, fuentes consultadas y cualquier información relevante para cumplimiento..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        La justificación es obligatoria y formará parte del expediente permanente de auditoría
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/">Cancelar</Link>
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4" />
                Guardar Declaración PEP
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Control de Acceso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usuario:</span>
                  <span className="text-sm font-medium">María González</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rol:</span>
                  <Badge variant="default">Oficial de Cumplimiento</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Permisos:</span>
                  <Badge variant="secondary">Crear/Modificar</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información Normativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Definición PEP según GAFI:</p>
                <p>
                  Personas que desempeñan o han desempeñado funciones públicas prominentes (jefes de estado, políticos
                  de alto nivel, funcionarios gubernamentales, judiciales o militares de alta jerarquía).
                </p>
                <p className="font-medium text-foreground mt-4">Requisitos:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Fuente de información documentada</li>
                  <li>Justificación técnica obligatoria</li>
                  <li>Aprobación de Oficial de Cumplimiento</li>
                  <li>Debida diligencia reforzada</li>
                  <li>Historial sin eliminación</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-base">Impacto en Evaluación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nivel de riesgo:</span>
                  <Badge className="bg-warning text-warning-foreground">Incrementado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Diligencia:</span>
                  <Badge variant="secondary">Reforzada</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monitoreo:</span>
                  <Badge variant="secondary">Continuo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
