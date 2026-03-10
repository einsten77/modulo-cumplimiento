import Link from "next/link"
import { Bell, ChevronLeft, Search, Filter, AlertTriangle, AlertCircle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BandejaAlertasPage() {
  const alertas = [
    {
      id: "ALT-2024-001",
      tipo: "Documento Vencido",
      expediente: "EXP-12345",
      cliente: "Juan Pérez",
      prioridad: "Crítica",
      estado: "Nueva",
      fecha: "2024-01-15",
      responsable: "Sin asignar",
      origen: "Gestión Documental",
    },
    {
      id: "ALT-2024-002",
      tipo: "Screening - Coincidencia",
      expediente: "EXP-12346",
      cliente: "María García",
      prioridad: "Alta",
      estado: "En seguimiento",
      fecha: "2024-01-14",
      responsable: "María González",
      origen: "Screening",
    },
    {
      id: "ALT-2024-003",
      tipo: "PEP Detectado",
      expediente: "EXP-12347",
      cliente: "Carlos Rodríguez",
      prioridad: "Alta",
      estado: "En seguimiento",
      fecha: "2024-01-14",
      responsable: "María González",
      origen: "Módulo PEP",
    },
    {
      id: "ALT-2024-004",
      tipo: "Documento Próximo a Vencer",
      expediente: "EXP-12348",
      cliente: "Ana López",
      prioridad: "Media",
      estado: "Atendida",
      fecha: "2024-01-13",
      responsable: "Luis Martínez",
      origen: "Gestión Documental",
    },
    {
      id: "ALT-2024-005",
      tipo: "Evaluación Riesgo Alto",
      expediente: "EXP-12349",
      cliente: "Pedro Sánchez",
      prioridad: "Alta",
      estado: "Nueva",
      fecha: "2024-01-13",
      responsable: "Sin asignar",
      origen: "Evaluación de Riesgo",
    },
    {
      id: "ALT-2024-006",
      tipo: "Documento Observado",
      expediente: "EXP-12350",
      cliente: "Sofía Fernández",
      prioridad: "Media",
      estado: "En seguimiento",
      fecha: "2024-01-12",
      responsable: "María González",
      origen: "Gestión Documental",
    },
    {
      id: "ALT-2024-007",
      tipo: "Screening - Coincidencia",
      expediente: "EXP-12351",
      cliente: "Roberto Díaz",
      prioridad: "Crítica",
      estado: "Nueva",
      fecha: "2024-01-12",
      responsable: "Sin asignar",
      origen: "Screening",
    },
    {
      id: "ALT-2024-008",
      tipo: "Monitoreo PEP",
      expediente: "EXP-12352",
      cliente: "Laura Martínez",
      prioridad: "Media",
      estado: "Cerrada",
      fecha: "2024-01-10",
      responsable: "María González",
      origen: "Módulo PEP",
    },
  ]

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "Crítica":
        return (
          <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
            {prioridad}
          </Badge>
        )
      case "Alta":
        return (
          <Badge variant="default" className="bg-warning text-warning-foreground">
            {prioridad}
          </Badge>
        )
      case "Media":
        return (
          <Badge variant="secondary" className="bg-info/20 text-info">
            {prioridad}
          </Badge>
        )
      default:
        return <Badge variant="outline">{prioridad}</Badge>
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Nueva":
        return (
          <Badge variant="default" className="bg-primary text-primary-foreground">
            {estado}
          </Badge>
        )
      case "En seguimiento":
        return (
          <Badge variant="default" className="bg-warning text-warning-foreground">
            {estado}
          </Badge>
        )
      case "Atendida":
        return (
          <Badge variant="default" className="bg-info text-info-foreground">
            {estado}
          </Badge>
        )
      case "Cerrada":
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            {estado}
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case "Crítica":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "Alta":
        return <AlertCircle className="h-5 w-5 text-warning" />
      case "Media":
        return <Info className="h-5 w-5 text-info" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
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
                <h1 className="text-2xl font-semibold text-foreground">SIAR - Bandeja de Alertas y Casos</h1>
                <p className="text-sm text-muted-foreground">Gestión Centralizada de Alertas del Sistema</p>
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
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al Panel Principal
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-2">Bandeja de Alertas</h2>
              <p className="text-muted-foreground">Centralización de todas las alertas generadas por el sistema SIAR</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                  Alertas Críticas
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">2</div>
                <p className="text-xs text-muted-foreground mt-1">Requieren acción inmediata</p>
              </CardContent>
            </Card>

            <Card className="border-warning/20 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                  Alertas Nuevas
                  <Bell className="h-5 w-5 text-warning" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">3</div>
                <p className="text-xs text-muted-foreground mt-1">Pendientes de asignación</p>
              </CardContent>
            </Card>

            <Card className="border-info/20 bg-info/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                  En Seguimiento
                  <Info className="h-5 w-5 text-info" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-info">3</div>
                <p className="text-xs text-muted-foreground mt-1">Casos en proceso</p>
              </CardContent>
            </Card>

            <Card className="border-success/20 bg-success/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between">
                  Cerradas (30 días)
                  <Bell className="h-5 w-5 text-success" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">24</div>
                <p className="text-xs text-muted-foreground mt-1">Casos resueltos</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Listado de Alertas</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avanzados
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por ID o expediente..." className="pl-9" />
                </div>

                <Select defaultValue="todos">
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="nueva">Nueva</SelectItem>
                    <SelectItem value="seguimiento">En seguimiento</SelectItem>
                    <SelectItem value="atendida">Atendida</SelectItem>
                    <SelectItem value="cerrada">Cerrada</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="todas">
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las prioridades</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="todos">
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Alerta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="documento">Documento Vencido</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="pep">PEP</SelectItem>
                    <SelectItem value="riesgo">Evaluación Riesgo</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="recientes">
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recientes">Más recientes</SelectItem>
                    <SelectItem value="antiguos">Más antiguos</SelectItem>
                    <SelectItem value="prioridad">Prioridad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">ID Alerta</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Expediente</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Prioridad</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Responsable</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((alerta) => (
                    <tr key={alerta.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getPrioridadIcon(alerta.prioridad)}
                          <span className="font-mono text-sm font-medium">{alerta.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{alerta.tipo}</p>
                          <p className="text-xs text-muted-foreground">{alerta.origen}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm">{alerta.expediente}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{alerta.cliente}</span>
                      </td>
                      <td className="py-4 px-4">{getPrioridadBadge(alerta.prioridad)}</td>
                      <td className="py-4 px-4">{getEstadoBadge(alerta.estado)}</td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{alerta.fecha}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{alerta.responsable}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Link href="/casos/detalle">
                          <Button variant="outline" size="sm">
                            Ver Detalle
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Mostrando 8 de 32 alertas totales</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-info/20 bg-info/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-info mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Nota Importante de Cumplimiento</p>
                <p className="text-sm text-muted-foreground">
                  Las alertas generadas por el sistema SIAR nunca se eliminan del sistema. Solo pueden cambiar de estado
                  a través del flujo de seguimiento y cierre documentado. Todo cambio queda registrado en el historial
                  de auditoría para inspección de SUDEASEG.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
