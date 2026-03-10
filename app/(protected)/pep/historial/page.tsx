import Link from "next/link"
import { ArrowLeft, Clock, User, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PepHistoryPage() {
  const historialCambios = [
    {
      id: 1,
      fecha: "2024-12-15 10:30:00",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
      accion: "Aprobación de condición PEP",
      condicionAnterior: "No PEP",
      condicionNueva: "PEP Actual",
      cargo: "Ministro de Economía y Finanzas",
      justificacion:
        "Cliente designado mediante Gaceta Oficial N° 42.500 del 10/12/2024 como Ministro de Economía y Finanzas. Se verificó nombramiento en fuentes oficiales y medios de comunicación.",
      estado: "Aprobado",
    },
    {
      id: 2,
      fecha: "2024-11-20 14:15:00",
      usuario: "Pedro Martínez",
      rol: "Unidad de Cumplimiento",
      accion: "Propuesta de clasificación PEP",
      condicionAnterior: "No PEP",
      condicionNueva: "PEP Actual (propuesta)",
      cargo: "Ministro de Economía y Finanzas",
      justificacion:
        "Se detectó mediante screening y verificación en medios que el cliente fue designado en cargo público de alto nivel.",
      estado: "Aprobado",
    },
    {
      id: 3,
      fecha: "2023-06-10 09:00:00",
      usuario: "Sistema SIAR",
      rol: "Sistema",
      accion: "Screening automático",
      condicionAnterior: "No PEP",
      condicionNueva: "No PEP",
      cargo: "-",
      justificacion: "Screening periódico automático sin coincidencias en listas PEP.",
      estado: "Completado",
    },
    {
      id: 4,
      fecha: "2023-01-15 11:30:00",
      usuario: "Ana Ramírez",
      rol: "Oficial de Cumplimiento",
      accion: "Evaluación inicial",
      condicionAnterior: "-",
      condicionNueva: "No PEP",
      cargo: "-",
      justificacion:
        "Evaluación inicial del expediente. Cliente declaró no ejercer ni haber ejercido cargos públicos. Sin hallazgos en fuentes consultadas.",
      estado: "Aprobado",
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
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Historial PEP</h1>
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
          <h2 className="text-3xl font-semibold text-foreground mb-2">Historial de Cambios PEP</h2>
          <p className="text-muted-foreground">
            Trazabilidad completa de cambios de condición PEP sin eliminación de registros
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Expediente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expediente</p>
                    <p className="font-semibold">EXP-2024-001234</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                    <p className="font-semibold">Carlos Alberto Rodríguez Pérez</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Documento</p>
                    <p className="font-semibold">V-12.345.678</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Condición Actual</p>
                    <Badge className="bg-warning text-warning-foreground">PEP Actual</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cargo</p>
                    <p className="font-semibold">Ministro de Economía y Finanzas</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Desde</p>
                    <p className="font-semibold">10/12/2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Filtros de Búsqueda</CardTitle>
                    <CardDescription>Refine el historial por fecha, usuario o tipo de acción</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-desde">Desde</Label>
                    <Input id="fecha-desde" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha-hasta">Hasta</Label>
                    <Input id="fecha-hasta" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usuario">Usuario</Label>
                    <Select>
                      <SelectTrigger id="usuario">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los usuarios</SelectItem>
                        <SelectItem value="maria">María González</SelectItem>
                        <SelectItem value="pedro">Pedro Martínez</SelectItem>
                        <SelectItem value="ana">Ana Ramírez</SelectItem>
                        <SelectItem value="sistema">Sistema SIAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accion">Tipo de Acción</Label>
                    <Select>
                      <SelectTrigger id="accion">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las acciones</SelectItem>
                        <SelectItem value="creacion">Creación</SelectItem>
                        <SelectItem value="modificacion">Modificación</SelectItem>
                        <SelectItem value="aprobacion">Aprobación</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Registro Cronológico</h3>
                <p className="text-sm text-muted-foreground">{historialCambios.length} registros en total</p>
              </div>

              {historialCambios.map((cambio, index) => (
                <Card key={cambio.id} className={index === 0 ? "border-primary/50" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {cambio.usuario === "Sistema SIAR" ? (
                            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{cambio.accion}</h4>
                            <Badge
                              variant={
                                cambio.estado === "Aprobado"
                                  ? "default"
                                  : cambio.estado === "Completado"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {cambio.estado}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {cambio.usuario}
                            </span>
                            <span>•</span>
                            <span>{cambio.rol}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {cambio.fecha}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Condición Anterior</p>
                        <Badge variant="outline">{cambio.condicionAnterior}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Condición Nueva</p>
                        <Badge
                          className={
                            cambio.condicionNueva.includes("PEP Actual")
                              ? "bg-warning text-warning-foreground"
                              : cambio.condicionNueva === "No PEP"
                                ? "bg-success text-success-foreground"
                                : ""
                          }
                        >
                          {cambio.condicionNueva}
                        </Badge>
                      </div>
                    </div>
                    {cambio.cargo !== "-" && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Cargo Público</p>
                        <p className="text-sm text-foreground">{cambio.cargo}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Justificación y Observaciones</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cambio.justificacion}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Control de Auditoría</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total cambios:</span>
                  <span className="font-semibold">{historialCambios.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Usuarios involucrados:</span>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Primer registro:</span>
                  <span className="font-semibold">15/01/2023</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Última actualización:</span>
                  <span className="font-semibold">15/12/2024</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Versionamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Política de Registros:</p>
                <ul className="space-y-2 ml-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Todos los cambios quedan registrados permanentemente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>No se permite eliminación de historial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Cada cambio incluye usuario responsable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Fecha y hora exacta con timestamp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Justificación obligatoria en cada modificación</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Acceso de Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Este historial está disponible en modo solo lectura para:</p>
                <ul className="space-y-1 ml-2">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Auditoría Interna</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Inspectores SUDEASEG</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Oficial de Cumplimiento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>Comité de Cumplimiento</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/pep/detalle">Ver Detalle Actual</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/pep/integracion">Ver Impacto en Riesgo</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Exportar Historial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
