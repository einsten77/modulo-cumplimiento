"use client"
import Link from "next/link"
import { ArrowLeft, Save, AlertTriangle, Calendar, FileText, ExternalLink, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PepDetailPage() {
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
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Detalle PEP</h1>
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
          <Link href="/pep/identificacion">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Identificación PEP
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Detalle de Persona Expuesta Políticamente</h2>
          <p className="text-muted-foreground">
            Registro completo de cargo público, fechas y documentación de respaldo
          </p>
        </div>

        <Card className="mb-6 border-warning bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-lg text-foreground">Cliente PEP - Riesgo Incrementado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carlos Alberto Rodríguez Pérez</span>
                <Badge className="bg-warning text-warning-foreground">PEP Actual</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Expediente: </span>
                  <span className="font-medium">EXP-2024-001234</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Documento: </span>
                  <span className="font-medium">V-12.345.678</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo: </span>
                  <span className="font-medium">PEP Nacional</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cargo o Función Pública</CardTitle>
                <CardDescription>Información del puesto o cargo que califica como PEP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo o Función Pública *</Label>
                  <Input id="cargo" placeholder="Ej: Ministro de Economía y Finanzas, Juez de la Corte Suprema, etc." />
                  <p className="text-xs text-muted-foreground">Especifique el cargo exacto según fuentes oficiales</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institucion">Institución u Organismo *</Label>
                  <Input id="institucion" placeholder="Ej: Ministerio del Poder Popular para Economía" />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-inicio">Fecha de Inicio del Cargo *</Label>
                    <div className="relative">
                      <Input id="fecha-inicio" type="date" />
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha-fin">Fecha de Fin del Cargo</Label>
                    <div className="relative">
                      <Input id="fecha-fin" type="date" />
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <p className="text-xs text-muted-foreground">Dejar en blanco si el cargo está vigente</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel-jerarquico">Nivel Jerárquico *</Label>
                  <Select>
                    <SelectTrigger id="nivel-jerarquico">
                      <SelectValue placeholder="Seleccione el nivel..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alto">Alto nivel (Ministros, Presidentes, Magistrados)</SelectItem>
                      <SelectItem value="medio">Nivel medio (Directores generales, Viceministros)</SelectItem>
                      <SelectItem value="otro">Otro nivel significativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuentes de Información y Documentación</CardTitle>
                <CardDescription>Respaldo documental y fuentes consultadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fuente-primaria">Fuente Primaria de Información *</Label>
                  <Select>
                    <SelectTrigger id="fuente-primaria">
                      <SelectValue placeholder="Seleccione la fuente principal..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autodeclaracion">Autodeclaración escrita del cliente</SelectItem>
                      <SelectItem value="gaceta">Gaceta Oficial</SelectItem>
                      <SelectItem value="registro">Registro público oficial</SelectItem>
                      <SelectItem value="medios">Medios de comunicación verificados</SelectItem>
                      <SelectItem value="screening">Sistema de Screening</SelectItem>
                      <SelectItem value="base-datos">Base de datos especializada (World-Check, etc.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url-referencia">URL o Referencia de la Fuente</Label>
                  <div className="flex gap-2">
                    <Input id="url-referencia" type="url" placeholder="https://..." className="flex-1" />
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentos">Documentos de Respaldo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arrastre archivos aquí o haga clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG, PNG hasta 10MB - Gacetas, nombramientos, capturas de pantalla
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                      Seleccionar Archivos
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuentes-adicionales">Fuentes Adicionales Consultadas</Label>
                  <Textarea
                    id="fuentes-adicionales"
                    placeholder="Liste todas las fuentes adicionales consultadas para verificar la condición PEP..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observaciones y Justificación Técnica</CardTitle>
                <CardDescription>Análisis y documentación para auditoría</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="justificacion">Justificación de la Clasificación PEP *</Label>
                  <Textarea
                    id="justificacion"
                    placeholder="Documente las razones técnicas por las cuales este cliente califica como PEP, incluyendo análisis del nivel de exposición pública, relevancia del cargo y cumplimiento de criterios GAFI..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta justificación es obligatoria y forma parte del expediente permanente para inspección de
                    SUDEASEG
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medidas-reforzadas">Medidas de Debida Diligencia Reforzada Aplicadas</Label>
                  <Textarea
                    id="medidas-reforzadas"
                    placeholder="Describa las medidas adicionales de debida diligencia que se han aplicado o se aplicarán a este cliente PEP..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones-adicionales">Observaciones Adicionales</Label>
                  <Textarea
                    id="observaciones-adicionales"
                    placeholder="Cualquier información adicional relevante para la gestión del riesgo de este cliente PEP..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/pep/identificacion">Cancelar</Link>
              </Button>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4" />
                Guardar Detalle PEP
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Estado de la Declaración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado actual:</span>
                  <Badge variant="secondary">En edición</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Creado por:</span>
                  <span className="text-sm font-medium">María González</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fecha creación:</span>
                  <span className="text-sm">15/12/2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Requiere:</span>
                  <Badge className="bg-warning text-warning-foreground">Aprobación OC</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Impacto en Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-medium text-foreground">Incremento Automático:</p>
                <ul className="space-y-2 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span className="text-muted-foreground">
                      Nivel de riesgo del cliente se incrementa automáticamente
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span className="text-muted-foreground">Se activan requisitos de diligencia reforzada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span className="text-muted-foreground">Se genera alerta para monitoreo continuo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span className="text-muted-foreground">
                      Documentación adicional obligatoria (origen de fondos, patrimonio)
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Requisitos Regulatorios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Documentación Obligatoria:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Cargo público documentado con fuente verificable</li>
                  <li>Fechas de inicio y fin del cargo (si aplica)</li>
                  <li>Fuentes de información identificadas</li>
                  <li>Justificación técnica completa</li>
                  <li>Respaldo documental anexo</li>
                  <li>Aprobación del Oficial de Cumplimiento</li>
                </ul>
                <p className="font-medium text-foreground mt-4">Normativa:</p>
                <p>Recomendaciones GAFI 12 y 22, Providencia SUDEBAN 320.11, normativa SUDEASEG aplicable.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones Relacionadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/pep/historial">Ver Historial de Cambios</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/pep/integracion">Ver Impacto en Riesgo</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/documentos">Ver Documentos del Expediente</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
