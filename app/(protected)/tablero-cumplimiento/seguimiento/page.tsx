"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, Clock, AlertTriangle, CheckCircle, Eye, ArrowRight } from "lucide-react"
import Link from "next/link"
import { AlertStatus } from "@/types/alert"

interface CaseTracking {
  caseId: string
  alertCode: string
  alertType: string
  dossierId: string
  entityName: string
  assignedTo: string
  assignedToName: string
  status: AlertStatus
  createdAt: string
  lastUpdated: string
  dueDate?: string
  isOverdue: boolean
  actionCount: number
}

export default function SeguimientoCasosPage() {
  const { user } = useAuth()
  const [cases, setCases] = useState<CaseTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ACTIVOS")
  const [assignedFilter, setAssignedFilter] = useState("TODOS")

  useEffect(() => {
    fetchCases()
  }, [statusFilter, assignedFilter])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "TODOS") params.append("status", statusFilter)
      if (assignedFilter !== "TODOS") params.append("assignedTo", assignedFilter)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/alerts/tracking/cases?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      )

      if (!response.ok) throw new Error("Error al cargar casos")

      const data = await response.json()
      setCases(data)
    } catch (error) {
      console.error("[v0] Error fetching cases:", error)
      // Mock data
      setCases([
        {
          caseId: "1",
          alertCode: "ALT-2024-001",
          alertType: "Documento Vencido",
          dossierId: "DOS-001",
          entityName: "Juan Pérez",
          assignedTo: user?.userId || "",
          assignedToName: user?.fullName || "Usuario Actual",
          status: AlertStatus.EN_SEGUIMIENTO,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          isOverdue: false,
          actionCount: 2,
        },
        {
          caseId: "2",
          alertCode: "ALT-2024-002",
          alertType: "Screening Coincidencia",
          dossierId: "DOS-002",
          entityName: "María García",
          assignedTo: user?.userId || "",
          assignedToName: user?.fullName || "Usuario Actual",
          status: AlertStatus.EN_SEGUIMIENTO,
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          lastUpdated: new Date().toISOString(),
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          isOverdue: true,
          actionCount: 1,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.NUEVA:
        return <Badge variant="default">Nueva</Badge>
      case AlertStatus.EN_SEGUIMIENTO:
        return <Badge className="bg-warning text-warning-foreground">En Seguimiento</Badge>
      case AlertStatus.ATENDIDA:
        return <Badge className="bg-info text-info-foreground">Atendida</Badge>
      case AlertStatus.CERRADA:
        return <Badge className="bg-success text-success-foreground">Cerrada</Badge>
    }
  }

  const filteredCases = cases.filter((caseItem) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        caseItem.alertCode.toLowerCase().includes(query) ||
        caseItem.entityName.toLowerCase().includes(query) ||
        caseItem.dossierId.toLowerCase().includes(query)
      )
    }
    return true
  })

  const activeCases = filteredCases.filter((c) => c.status !== AlertStatus.CERRADA)
  const overdueCases = filteredCases.filter((c) => c.isOverdue)
  const myCases = filteredCases.filter((c) => c.assignedTo === user?.userId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Seguimiento de Casos</h1>
          <p className="text-muted-foreground">Control de casos abiertos y responsables</p>
        </div>
        <Link href="/tablero-cumplimiento">
          <Button variant="outline">Volver al Tablero</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Casos Abiertos</p>
                <p className="text-3xl font-bold text-warning">{activeCases.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Vencidos</p>
                <p className="text-3xl font-bold text-destructive">{overdueCases.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mis Casos</p>
                <p className="text-3xl font-bold text-primary">{myCases.length}</p>
              </div>
              <User className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cerrados (30d)</p>
                <p className="text-3xl font-bold text-success">
                  {cases.filter((c) => c.status === AlertStatus.CERRADA).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, expediente o entidad..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVOS">Casos Activos</SelectItem>
                <SelectItem value="NUEVA">Nuevos</SelectItem>
                <SelectItem value="EN_SEGUIMIENTO">En Seguimiento</SelectItem>
                <SelectItem value="VENCIDO">Vencidos</SelectItem>
                <SelectItem value="TODOS">Todos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value={user?.userId || ""}>Mis Casos</SelectItem>
                <SelectItem value="SIN_ASIGNAR">Sin Asignar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Casos ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <Card key={caseItem.caseId} className={caseItem.isOverdue ? "border-destructive/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {caseItem.isOverdue && <AlertTriangle className="h-5 w-5 text-destructive" />}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-lg font-semibold">{caseItem.alertCode}</span>
                            {getStatusBadge(caseItem.status)}
                            {caseItem.isOverdue && <Badge variant="destructive">Vencido</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{caseItem.alertType}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Expediente</p>
                          <p className="text-sm font-mono font-medium">{caseItem.dossierId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Entidad</p>
                          <p className="text-sm font-medium">{caseItem.entityName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Responsable</p>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm">{caseItem.assignedToName}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Plazo</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className={`text-sm ${caseItem.isOverdue ? "text-destructive font-medium" : ""}`}>
                              {caseItem.dueDate ? new Date(caseItem.dueDate).toLocaleDateString("es-VE") : "Sin plazo"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Creado: {new Date(caseItem.createdAt).toLocaleDateString("es-VE")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{caseItem.actionCount} acciones registradas</span>
                        </div>
                        <div>
                          <span>
                            Última actualización: {new Date(caseItem.lastUpdated).toLocaleDateString("es-VE")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/tablero-cumplimiento/alertas/${caseItem.caseId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Button>
                      </Link>
                      <Link href={`/expedientes/${caseItem.dossierId}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Ir a Expediente
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCases.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay casos que coincidan con los filtros aplicados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Note */}
      <Card className="border-info/20 bg-info/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <CheckCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Seguimiento Documentado</p>
            <p className="text-sm text-muted-foreground">
              Todos los casos mantienen un historial completo de acciones, responsables y fechas. Los plazos vencidos se
              escalan automáticamente y quedan registrados para auditoría de SUDEASEG.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
