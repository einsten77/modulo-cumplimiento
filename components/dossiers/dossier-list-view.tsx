"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, FileText, Plus, Search, AlertTriangle, Eye } from "lucide-react"
import Link from "next/link"
import { dossierService } from "@/lib/api/dossiers"
import type { Dossier, DossierFilters } from "@/types/dossier"
import { useAuth } from "@/lib/auth/auth-context"

type DossierListViewProps = {
  /**
   * Filtro inicial opcional para el tipo de sujeto.
   * Mantiene compatibilidad con todas las páginas existentes.
   *
   * Valores esperados (según el backend/tipos):
   * "CLIENT" | "INTERMEDIARY" | "EMPLOYEE" | "PROVIDER" | "REINSURER" | "RETROCESSIONAIRE"
   */
  initialSubjectType?: string
}

export function DossierListView({ initialSubjectType }: DossierListViewProps = {}) {
  const { user, hasRole } = useAuth()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterType, setFilterType] = React.useState<string>(initialSubjectType ?? "ALL")
  const [filterRisk, setFilterRisk] = React.useState<string>("ALL")
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL")
  const [dossiers, setDossiers] = React.useState<Dossier[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [summary, setSummary] = React.useState({
    total: 0,
    underReview: 0,
    incomplete: 0,
    highRisk: 0,
  })

  const isReadOnly = hasRole(["AUDITOR_INTERNO", "REGULADOR_SUDEASEG"])

  React.useEffect(() => {
    loadDossiers()
    loadSummary()
  }, [filterType, filterRisk, filterStatus, searchQuery])

  const loadDossiers = async () => {
    try {
      setIsLoading(true)
      const filters: DossierFilters = {
        search: searchQuery || undefined,
        subjectType: filterType !== "ALL" ? (filterType as any) : undefined,
        riskLevel: filterRisk !== "ALL" ? (filterRisk as any) : undefined,
        status: filterStatus !== "ALL" ? (filterStatus as any) : undefined,
      }

      const response = await dossierService.list(filters)
      setDossiers(response.data)
    } catch (error) {
      console.error("[v0] Error loading dossiers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const data = await dossierService.getSummary()
      setSummary({
        total: data.total,
        underReview: data.byStatus.UNDER_REVIEW || 0,
        incomplete: data.byStatus.INCOMPLETE || 0,
        highRisk: data.byRisk.HIGH || 0,
      })
    } catch (error) {
      console.error("[v0] Error loading summary:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      INCOMPLETE: { label: "Incompleto", variant: "secondary" as const, icon: Clock },
      UNDER_REVIEW: { label: "En Revisión", variant: "default" as const, icon: FileText },
      REQUIRES_INFO: { label: "Requiere Info", variant: "outline" as const, icon: AlertCircle },
      OBSERVED: { label: "Observado", variant: "destructive" as const, icon: AlertTriangle },
      APPROVED: { label: "Aprobado", variant: "default" as const, icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon

    return (
      <Badge variant={config?.variant} className="gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {config?.label}
      </Badge>
    )
  }

  const getRiskBadge = (risk: string) => {
    const riskConfig = {
      LOW: { label: "Bajo", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      MEDIUM: { label: "Medio", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      HIGH: { label: "Alto", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    }

    const config = riskConfig[risk as keyof typeof riskConfig]

    return (
      <Badge variant="outline" className={config?.className}>
        {config?.label}
      </Badge>
    )
  }

  const getSubjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CLIENT: "Cliente",
      INTERMEDIARY: "Intermediario",
      EMPLOYEE: "Empleado",
      PROVIDER: "Proveedor",
      REINSURER: "Reasegurador",
      RETROCESSIONAIRE: "Retrocesionario",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expedientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Revisión</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.underReview}</div>
            <p className="text-xs text-muted-foreground">Pendientes de aprobación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incompletos</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.incomplete}</div>
            <p className="text-xs text-muted-foreground">Requieren completar datos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Riesgo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.highRisk}</div>
            <p className="text-xs text-muted-foreground">Requieren atención prioritaria</p>
          </CardContent>
        </Card>
      </div>

      {isReadOnly && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="flex items-center gap-2 py-3">
            <Eye className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-medium text-blue-500">
              Modo de solo lectura: Puede visualizar expedientes pero no realizar modificaciones
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Listado de Expedientes</CardTitle>
            {!isReadOnly && (
              <Link href="/dossiers/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Expediente
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="CLIENT">Cliente</SelectItem>
                <SelectItem value="INTERMEDIARY">Intermediario</SelectItem>
                <SelectItem value="EMPLOYEE">Empleado</SelectItem>
                <SelectItem value="PROVIDER">Proveedor</SelectItem>
                <SelectItem value="REINSURER">Reasegurador</SelectItem>
                <SelectItem value="RETROCESSIONAIRE">Retrocesionario</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Riesgo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="LOW">Bajo</SelectItem>
                <SelectItem value="MEDIUM">Medio</SelectItem>
                <SelectItem value="HIGH">Alto</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="INCOMPLETE">Incompleto</SelectItem>
                <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
                <SelectItem value="REQUIRES_INFO">Requiere Info</SelectItem>
                <SelectItem value="OBSERVED">Observado</SelectItem>
                <SelectItem value="APPROVED">Aprobado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Estatus</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : dossiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No se encontraron expedientes.
                    </TableCell>
                  </TableRow>
                ) : (
                  dossiers.map((dossier) => (
                    <TableRow key={dossier.id}>
                      <TableCell className="font-medium">{dossier.subjectName}</TableCell>
                      <TableCell>{dossier.documentNumber}</TableCell>
                      <TableCell>{getSubjectTypeLabel(dossier.subjectType)}</TableCell>
                      <TableCell>{getRiskBadge(dossier.riskLevel)}</TableCell>
                      <TableCell>{getStatusBadge(dossier.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dossiers/${dossier.id}`}>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
