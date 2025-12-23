"use client"
import { useAuth } from "@/lib/auth/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Search, Download, Eye, Lock, FileText, AlertTriangle, User, Filter, Building2 } from "lucide-react"

export default function VistaInspectorPage() {
  const { user, hasRole } = useAuth()
  const router = useRouter()

  // Only allow auditors and inspectors
  if (!hasRole(["AUDITOR_INTERNO", "AUDITOR_EXTERNO", "REGULADOR_SUDEASEG"])) {
    router.push("/dashboard")
    return null
  }

  const isInspector = user?.role === "REGULADOR_SUDEASEG"

  const dossiers = [
    {
      id: "1",
      code: "EXP-2024-045",
      clientName: "Roberto Gutiérrez Silva",
      clientType: "Persona Natural",
      riskLevel: "Alto",
      status: "Activo",
      createdDate: "2024-11-15",
      lastUpdate: "2024-12-15",
      isPEP: true,
      hasAlerts: true,
      screeningMatches: 1,
      department: "Comercial",
    },
    {
      id: "2",
      code: "EXP-2024-044",
      clientName: "Transportes Rápidos CA",
      clientType: "Persona Jurídica",
      riskLevel: "Medio",
      status: "Activo",
      createdDate: "2024-11-20",
      lastUpdate: "2024-12-14",
      isPEP: false,
      hasAlerts: false,
      screeningMatches: 0,
      department: "Operaciones",
    },
    {
      id: "3",
      code: "EXP-2024-043",
      clientName: "María Elena Rodríguez",
      clientType: "Persona Natural",
      riskLevel: "Alto",
      status: "En Revisión",
      createdDate: "2024-11-18",
      lastUpdate: "2024-12-13",
      isPEP: true,
      hasAlerts: true,
      screeningMatches: 0,
      department: "Comercial",
    },
  ]

  const getRiskBadge = (level: string) => {
    const configs = {
      Alto: { color: "bg-destructive text-white", label: "Alto" },
      Medio: { color: "bg-warning text-white", label: "Medio" },
      Bajo: { color: "bg-[#00bf63] text-white", label: "Bajo" },
    }
    const config = configs[level as keyof typeof configs]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      Activo: { color: "bg-[#00bf63] text-white", label: "Activo" },
      "En Revisión": { color: "bg-info text-white", label: "En Revisión" },
      Suspendido: { color: "bg-destructive text-white", label: "Suspendido" },
    }
    const config = configs[status as keyof typeof configs] || configs.Activo
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const statistics = {
    totalDossiers: 156,
    highRisk: 23,
    withPEP: 12,
    withAlerts: 18,
    screeningMatches: 5,
    pendingReview: 8,
  }

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${isInspector ? "border-[#fce809]" : "border-info"}`}>
        <CardHeader className={isInspector ? "bg-[#fce809]/10" : "bg-info/10"}>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#00bf63]" />
                {isInspector ? "Vista de Inspector SUDEASEG" : "Vista de Auditor Externo"}
              </CardTitle>
              <CardDescription className="mt-2">
                Acceso de solo lectura a todos los expedientes y registros del sistema SIAR
              </CardDescription>
            </div>
            <Badge
              className={`text-base px-4 py-2 ${isInspector ? "bg-[#fce809] text-[#7f8083]" : "bg-info text-white"}`}
            >
              <Lock className="h-4 w-4 mr-2" />
              Solo Lectura
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <Eye className="h-5 w-5 text-[#00bf63]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Inspector: {user?.fullName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Todas las acciones en esta vista son de consulta únicamente. No se permiten modificaciones.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar Reporte Completo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Expedientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{statistics.totalDossiers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Riesgo Alto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{statistics.highRisk}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-[#fce809]" />
              Con PEP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fce809]">{statistics.withPEP}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-warning" />
              Coincidencias Screening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{statistics.screeningMatches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Con Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{statistics.withAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-info" />
              Pendientes de Revisión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{statistics.pendingReview}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-[#00bf63]/5">
          <CardTitle>Filtros Predefinidos - Navegación Estructurada</CardTitle>
          <CardDescription>Filtros especializados para facilitar la inspección regulatoria</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#00bf63]" />
                Nivel de Riesgo
              </label>
              <Select defaultValue="todos">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Niveles</SelectItem>
                  <SelectItem value="alto">Riesgo Alto</SelectItem>
                  <SelectItem value="medio">Riesgo Medio</SelectItem>
                  <SelectItem value="bajo">Riesgo Bajo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-[#00bf63]" />
                Clasificación PEP
              </label>
              <Select defaultValue="todos">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pep">Solo PEP</SelectItem>
                  <SelectItem value="vinculado">PEP Vinculado</SelectItem>
                  <SelectItem value="no-pep">No PEP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#00bf63]" />
                Estado de Alertas
              </label>
              <Select defaultValue="todos">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="con-alertas">Con Alertas Activas</SelectItem>
                  <SelectItem value="screening">Con Coincidencias Screening</SelectItem>
                  <SelectItem value="sin-alertas">Sin Alertas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#00bf63]" />
                Departamento
              </label>
              <Select defaultValue="todos">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="operaciones">Operaciones</SelectItem>
                  <SelectItem value="administracion">Administración</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Search className="h-4 w-4 text-[#00bf63]" />
                Búsqueda de Expediente
              </label>
              <Input placeholder="Código o nombre del cliente..." />
            </div>

            <div className="flex items-end lg:col-span-2">
              <Button className="w-full gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white">
                <Search className="h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expedientes Disponibles</CardTitle>
          <CardDescription>{dossiers.length} expedientes mostrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Código</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Riesgo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Indicadores</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Última Actualización</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dossiers.map((dossier) => (
                  <tr key={dossier.id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-[#00bf63]">{dossier.code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-foreground">{dossier.clientName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">{dossier.clientType}</span>
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(dossier.riskLevel)}</td>
                    <td className="py-3 px-4">{getStatusBadge(dossier.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {dossier.isPEP && <Badge className="bg-[#fce809] text-[#7f8083] text-xs">PEP</Badge>}
                        {dossier.hasAlerts && <Badge className="bg-destructive text-white text-xs">Alertas</Badge>}
                        {dossier.screeningMatches > 0 && (
                          <Badge className="bg-warning text-white text-xs">Screening</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">{dossier.lastUpdate}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button size="sm" variant="ghost" className="gap-1 text-[#00bf63] hover:text-[#37ce48]">
                        <Eye className="h-4 w-4" />
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-info">
        <CardHeader className="bg-info/5">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-info" />
            Características de la Vista de Inspector
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Acceso Total de Solo Lectura:</strong> Visualización completa de todos los expedientes,
                documentos y registros sin posibilidad de modificación.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Filtros Predefinidos:</strong> Navegación estructurada por criterios regulatorios (riesgo, PEP,
                alertas, screening).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Evidencia Inmediata:</strong> Acceso directo a bitácora de auditoría, registro de actividad
                crítica y documentación completa.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00bf63] mt-1">•</span>
              <span>
                <strong>Trazabilidad Regulatoria:</strong> Todos los accesos del inspector quedan registrados
                automáticamente en la bitácora inmutable.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
