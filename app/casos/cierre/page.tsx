import Link from "next/link"
import { ChevronLeft, Lock, AlertTriangle, CheckCircle, FileText, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CierreAlertaPage() {
  const caso = {
    id: "ALT-2024-001",
    tipo: "Documento Vencido",
    expediente: "EXP-12345",
    cliente: "Juan Pérez",
    estado: "Atendida",
    prioridad: "Crítica",
    fechaGeneracion: "2024-01-15",
    diasAbierto: 2,
    accionesTomadas: 5,
  }

  const resumenSeguimiento = [
    {
      fecha: "2024-01-15",
      accion: "Caso asignado y cliente contactado",
    },
    {
      fecha: "2024-01-16",
      accion: "Documento actualizado recibido y cargado",
    },
    {
      fecha: "2024-01-16",
      accion: "Documento revisado y aprobado",
    },
  ]

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
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Cierre de Alerta</h1>
                <p className="text-sm text-muted-foreground">Exclusivo para Oficial de Cumplimiento</p>
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
        <Link href="/casos/seguimiento">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Seguimiento
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-destructive" />
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">Cierre de Alerta - Acción Restringida</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Solo el Oficial de Cumplimiento puede cerrar alertas. Esta acción es irreversible y queda
                      registrada permanentemente.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="bg-accent/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{caso.id}</CardTitle>
                      <Badge variant="destructive">{caso.prioridad}</Badge>
                      <Badge variant="default" className="bg-info text-info-foreground">
                        {caso.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {caso.tipo} - Expediente {caso.expediente}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha de Generación</p>
                    <p className="text-sm font-medium text-foreground">{caso.fechaGeneracion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Días Abierto</p>
                    <p className="text-sm font-medium text-foreground">{caso.diasAbierto} días</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Acciones Tomadas</p>
                    <p className="text-sm font-medium text-foreground">{caso.accionesTomadas}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Resumen de Seguimiento</h3>
                  <div className="space-y-2">
                    {resumenSeguimiento.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground">{item.fecha}:</span> {item.accion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Formulario de Cierre de Alerta
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Clasificación del Cierre <span className="text-destructive">*</span>
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la clasificación..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mitigado">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <div>
                            <p className="font-medium">Riesgo Mitigado</p>
                            <p className="text-xs text-muted-foreground">El riesgo fue resuelto satisfactoriamente</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="aceptado">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <div>
                            <p className="font-medium">Riesgo Aceptado</p>
                            <p className="text-xs text-muted-foreground">
                              Se acepta el riesgo bajo criterios establecidos
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="escalado">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-destructive" />
                          <div>
                            <p className="font-medium">Escalado</p>
                            <p className="text-xs text-muted-foreground">
                              Requiere escalamiento a instancias superiores
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta clasificación determina cómo se registrará el cierre en el sistema de gestión de riesgos.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Justificación del Cierre <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="Describa detalladamente las razones que justifican el cierre de esta alerta. Incluya las acciones tomadas, resultados obtenidos y análisis de cumplimiento..."
                    className="min-h-40 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    La justificación es obligatoria y debe ser completa. Será parte del registro permanente y estará
                    disponible para auditoría de SUDEASEG.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Medidas Preventivas Implementadas (Opcional)
                  </label>
                  <Textarea
                    placeholder="Describa cualquier medida preventiva o correctiva implementada para evitar la recurrencia de este tipo de alertas..."
                    className="min-h-32 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Observaciones Adicionales (Opcional)
                  </label>
                  <Textarea
                    placeholder="Cualquier información adicional relevante para el cierre del caso..."
                    className="min-h-24 resize-none"
                  />
                </div>

                <Separator />

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Advertencia Importante</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>El cierre de una alerta es una acción irreversible</li>
                        <li>La alerta NO se eliminará del sistema, solo cambiará a estado "Cerrada"</li>
                        <li>La justificación quedará registrada permanentemente</li>
                        <li>SUDEASEG tendrá acceso completo a este registro</li>
                        <li>Alertas críticas requieren justificación detallada obligatoria</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/casos/seguimiento" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Cancelar
                    </Button>
                  </Link>
                  <Button className="flex-1 bg-destructive hover:bg-destructive/90">
                    <Lock className="h-4 w-4 mr-2" />
                    Cerrar Alerta Definitivamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-destructive" />
                  Control de Acceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-foreground">
                    Esta funcionalidad está restringida exclusivamente al Oficial de Cumplimiento según política RBAC
                    del sistema.
                  </p>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Usuario Autorizado</p>
                    <p className="text-sm font-medium text-foreground">María González</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rol</p>
                    <p className="text-sm font-medium text-foreground">Oficial de Cumplimiento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Caso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ID Alerta</p>
                  <p className="text-sm font-mono font-medium text-foreground">{caso.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expediente</p>
                  <p className="text-sm font-mono font-medium text-foreground">{caso.expediente}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                  <p className="text-sm font-medium text-foreground">{caso.cliente}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Estado Actual</p>
                  <Badge variant="default" className="bg-info text-info-foreground">
                    {caso.estado}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Requisitos de Cierre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">Estado "Atendida" confirmado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">Seguimiento documentado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground">Acciones registradas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Justificación pendiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clasificación pendiente</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas del Caso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tiempo de Resolución</span>
                  <span className="text-sm font-semibold text-success">2 días</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de Acciones</span>
                  <span className="text-sm font-semibold text-foreground">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usuarios Involucrados</span>
                  <span className="text-sm font-semibold text-foreground">2</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
