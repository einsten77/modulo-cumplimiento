import Link from "next/link"
import { ChevronLeft, AlertTriangle, FileText, Calendar, User, Clock, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function DetalleAlertaPage() {
  const alerta = {
    id: "ALT-2024-001",
    tipo: "Documento Vencido",
    expediente: "EXP-12345",
    cliente: {
      nombre: "Juan Pérez",
      identificacion: "V-12.345.678",
      tipo: "Persona Natural",
    },
    prioridad: "Crítica",
    estado: "Nueva",
    fechaGeneracion: "2024-01-15 09:30:00",
    fechaEvento: "2024-01-10",
    responsable: "Sin asignar",
    origen: "Gestión Documental",
    motivo: "RIF vencido desde hace 5 días",
    descripcion:
      "El documento RIF del expediente EXP-12345 se encuentra vencido desde el 10/01/2024. Según las políticas internas y normativas SUDEASEG, todo expediente debe mantener documentación vigente. Se requiere solicitar actualización inmediata al cliente.",
    detallesEvento: {
      documento: "Registro de Información Fiscal (RIF)",
      fechaVencimiento: "2024-01-10",
      diasVencido: 5,
      ultimaActualizacion: "2023-01-10",
      cargadoPor: "Ana López - Administrativo",
    },
    impactoRiesgo: {
      nivel: "Alto",
      puntaje: "+15 puntos",
      descripcion: "Documentación vencida incrementa el riesgo del expediente",
    },
    accionesRequeridas: [
      "Notificar al cliente sobre el documento vencido",
      "Solicitar documento actualizado",
      "Suspender operaciones si aplica según política de riesgo",
      "Documentar gestión realizada",
    ],
  }

  const historial = [
    {
      fecha: "2024-01-15 09:30:15",
      usuario: "Sistema SIAR",
      accion: "Alerta generada automáticamente",
      tipo: "sistema",
      detalles: "Detector automático de vencimientos identificó documento RIF vencido",
    },
    {
      fecha: "2024-01-15 09:31:00",
      usuario: "Sistema SIAR",
      accion: "Notificación enviada",
      tipo: "sistema",
      detalles: "Email automático enviado a Oficial de Cumplimiento y Unidad de Cumplimiento",
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
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Detalle de Alerta</h1>
                <p className="text-sm text-muted-foreground">Información Completa del Caso</p>
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
        <Link href="/casos/bandeja">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Bandeja de Alertas
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-destructive/20">
              <CardHeader className="bg-destructive/5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <CardTitle className="text-2xl">{alerta.id}</CardTitle>
                      <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                        {alerta.prioridad}
                      </Badge>
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        {alerta.estado}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium text-foreground">{alerta.tipo}</p>
                    <p className="text-sm text-muted-foreground">{alerta.motivo}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Descripción del Evento</h3>
                  <p className="text-sm text-foreground leading-relaxed">{alerta.descripcion}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Acciones Requeridas</h3>
                  <ul className="space-y-2">
                    {alerta.accionesRequeridas.map((accion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-sm text-foreground">{accion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Detalles del Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Documento Afectado</p>
                    <p className="text-sm font-medium text-foreground">{alerta.detallesEvento.documento}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fecha de Vencimiento</p>
                    <p className="text-sm font-medium text-foreground">{alerta.detallesEvento.fechaVencimiento}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Días Vencido</p>
                    <p className="text-sm font-medium text-destructive">{alerta.detallesEvento.diasVencido} días</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Última Actualización</p>
                    <p className="text-sm font-medium text-foreground">{alerta.detallesEvento.ultimaActualizacion}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Cargado Por</p>
                    <p className="text-sm font-medium text-foreground">{alerta.detallesEvento.cargadoPor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Impacto en Evaluación de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nivel de Riesgo</span>
                    <Badge variant="default" className="bg-warning text-warning-foreground">
                      {alerta.impactoRiesgo.nivel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Incremento de Puntaje</span>
                    <span className="text-sm font-semibold text-warning">{alerta.impactoRiesgo.puntaje}</span>
                  </div>
                  <p className="text-sm text-foreground">{alerta.impactoRiesgo.descripcion}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Historial de Acciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historial.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-2 w-2 rounded-full ${item.tipo === "sistema" ? "bg-primary" : "bg-success"}`}
                        />
                        {index < historial.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-foreground">{item.accion}</p>
                          <span className="text-xs text-muted-foreground">{item.fecha}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Por: {item.usuario}</p>
                        <p className="text-sm text-muted-foreground">{item.detalles}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Módulo Origen</p>
                  <p className="text-sm font-medium text-foreground">{alerta.origen}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fecha de Generación</p>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="h-4 w-4" />
                    {alerta.fechaGeneracion}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fecha del Evento</p>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="h-4 w-4" />
                    {alerta.fechaEvento}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Responsable Asignado</p>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <User className="h-4 w-4" />
                    {alerta.responsable}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expediente Asociado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Número de Expediente</p>
                  <p className="text-sm font-mono font-medium text-foreground">{alerta.expediente}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                  <p className="text-sm font-medium text-foreground">{alerta.cliente.nombre}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Identificación</p>
                  <p className="text-sm font-medium text-foreground">{alerta.cliente.identificacion}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                  <p className="text-sm font-medium text-foreground">{alerta.cliente.tipo}</p>
                </div>
                <Link href="/expedientes/detalle">
                  <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Expediente Completo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/casos/seguimiento" className="block">
                  <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                    Dar Seguimiento
                  </Button>
                </Link>
                <Button variant="outline" className="w-full bg-transparent">
                  Asignar Responsable
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Cambiar Prioridad
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
