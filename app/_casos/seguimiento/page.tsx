import Link from "next/link"
import { ChevronLeft, MessageSquare, User, Calendar, Send, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SeguimientoCasoPage() {
  const caso = {
    id: "ALT-2024-001",
    tipo: "Documento Vencido",
    expediente: "EXP-12345",
    cliente: "Juan Pérez",
    estado: "En seguimiento",
    prioridad: "Crítica",
  }

  const seguimiento = [
    {
      id: 1,
      fecha: "2024-01-15 14:45:00",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
      tipo: "asignacion",
      accion: "Caso asignado",
      comentario:
        "He asignado este caso a la Unidad de Cumplimiento para gestión inmediata. Se requiere contactar al cliente urgentemente.",
      estadoAnterior: "Nueva",
      estadoNuevo: "En seguimiento",
    },
    {
      id: 2,
      fecha: "2024-01-15 15:30:00",
      usuario: "Luis Martínez",
      rol: "Unidad de Cumplimiento",
      tipo: "comentario",
      accion: "Comentario agregado",
      comentario:
        "Contacté al cliente vía telefónica. Confirmó que tiene el documento actualizado y se compromete a enviarlo mañana 16/01/2024 antes de las 12:00 PM.",
      estadoAnterior: null,
      estadoNuevo: null,
    },
    {
      id: 3,
      fecha: "2024-01-16 09:15:00",
      usuario: "Luis Martínez",
      rol: "Unidad de Cumplimiento",
      tipo: "seguimiento",
      accion: "Seguimiento registrado",
      comentario:
        "Cliente envió documento actualizado vía email. Documento recibido y cargado en el sistema. Pendiente de revisión y aprobación por Cumplimiento.",
      estadoAnterior: null,
      estadoNuevo: null,
    },
    {
      id: 4,
      fecha: "2024-01-16 11:00:00",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
      tipo: "comentario",
      accion: "Comentario agregado",
      comentario:
        "Revisé documento cargado. RIF actualizado con fecha de emisión 15/01/2024 y vencimiento 15/01/2025. Documento cumple con requisitos. Procedo a aprobar y cambiar estado a Atendida.",
      estadoAnterior: null,
      estadoNuevo: null,
    },
  ]

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "asignacion":
        return "🔄"
      case "comentario":
        return "💬"
      case "seguimiento":
        return "📋"
      case "cambio_estado":
        return "📊"
      default:
        return "📌"
    }
  }

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
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Seguimiento de Caso</h1>
                <p className="text-sm text-muted-foreground">Registro Cronológico de Acciones y Comentarios</p>
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
        <Link href="/casos/detalle">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Detalle de Alerta
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{caso.id}</CardTitle>
                      <Badge variant="destructive">{caso.prioridad}</Badge>
                      <Badge variant="default" className="bg-warning text-warning-foreground">
                        {caso.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {caso.tipo} - Expediente {caso.expediente}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Registro Cronológico de Seguimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {seguimiento.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                          {getTipoIcon(item.tipo)}
                        </div>
                        {index < seguimiento.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: "60px" }} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="bg-accent/50 rounded-lg p-4 border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.accion}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{item.usuario}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{item.rol}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {item.fecha}
                            </div>
                          </div>

                          <p className="text-sm text-foreground mt-3 leading-relaxed">{item.comentario}</p>

                          {item.estadoAnterior && item.estadoNuevo && (
                            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Estado:</span>
                              <Badge variant="outline" className="text-xs">
                                {item.estadoAnterior}
                              </Badge>
                              <span className="text-muted-foreground">→</span>
                              <Badge variant="default" className="bg-warning text-warning-foreground text-xs">
                                {item.estadoNuevo}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Agregar Nueva Acción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Tipo de Acción</label>
                  <Select defaultValue="comentario">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comentario">Comentario / Observación</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento de Gestión</SelectItem>
                      <SelectItem value="contacto">Contacto con Cliente</SelectItem>
                      <SelectItem value="documento">Documento Recibido</SelectItem>
                      <SelectItem value="escalamiento">Escalamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Comentario / Detalles de la Acción
                  </label>
                  <Textarea
                    placeholder="Describa la acción realizada, gestión efectuada o comentarios relevantes para el seguimiento del caso..."
                    className="min-h-32 resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Este comentario quedará registrado en el historial del caso y será visible para todos los usuarios
                    autorizados.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Cambiar Estado del Caso (Opcional)
                  </label>
                  <Select defaultValue="mantener">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mantener">Mantener estado actual</SelectItem>
                      <SelectItem value="seguimiento">En seguimiento</SelectItem>
                      <SelectItem value="atendida">Atendida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4 mr-2" />
                  Registrar Acción
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
                  <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                  <p className="text-sm font-medium text-foreground">{caso.tipo}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expediente</p>
                  <p className="text-sm font-mono font-medium text-foreground">{caso.expediente}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                  <p className="text-sm font-medium text-foreground">{caso.cliente}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-info/20 bg-info/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Nota de Seguimiento</p>
                    <p className="text-sm text-muted-foreground text-balance">
                      Todo registro de seguimiento queda almacenado permanentemente en el sistema SIAR. No se permite la
                      eliminación de registros para garantizar trazabilidad completa ante SUDEASEG.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full bg-transparent">
                  Asignar a Otro Usuario
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Cambiar Prioridad
                </Button>
                <Link href="/casos/cierre" className="block">
                  <Button variant="destructive" className="w-full">
                    Cerrar Alerta
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de Acciones</span>
                  <span className="text-sm font-semibold text-foreground">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usuarios Involucrados</span>
                  <span className="text-sm font-semibold text-foreground">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Días en Seguimiento</span>
                  <span className="text-sm font-semibold text-foreground">1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
