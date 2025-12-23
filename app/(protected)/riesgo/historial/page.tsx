"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, FileText, Search, AlertTriangle, Eye } from "lucide-react"
import type { RiskEvaluation } from "@/types/risk-evaluation"

export default function HistorialEvaluacionesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkPermission } = useAuth()

  const dossierId = searchParams.get("dossierId")

  const [evaluations, setEvaluations] = useState<RiskEvaluation[]>([])
  const [filteredEvaluations, setFilteredEvaluations] = useState<RiskEvaluation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canRead = checkPermission("risk:history:read")

  useEffect(() => {
    if (canRead) {
      fetchHistory()
    }
  }, [dossierId, canRead])

  useEffect(() => {
    if (searchTerm) {
      setFilteredEvaluations(
        evaluations.filter(
          (ev) =>
            ev.evaluationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.dossierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.evaluatorName?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    } else {
      setFilteredEvaluations(evaluations)
    }
  }, [searchTerm, evaluations])

  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = dossierId
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/risk-evaluations/dossiers/${dossierId}/history`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/risk-evaluations/history`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar el historial")
      }

      const data = await response.json()
      setEvaluations(data || [])
      setFilteredEvaluations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tiene permisos para acceder al historial de evaluaciones. Contacte al Oficial de Cumplimiento.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-semibold text-foreground">Historial de Evaluaciones de Riesgo</h1>
          </div>
          <p className="text-muted-foreground">
            Auditoría completa de todas las versiones de evaluación - Solo lectura
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Búsqueda de Evaluaciones</CardTitle>
          <CardDescription>Busque por ID de evaluación, expediente o evaluador</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar evaluaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Versiones Anteriores</CardTitle>
          <CardDescription>{filteredEvaluations.length} evaluación(es) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando historial...</div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron evaluaciones</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Evaluación</TableHead>
                    <TableHead>Expediente</TableHead>
                    <TableHead>Versión</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nivel Riesgo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Evaluador</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.evaluationId}>
                      <TableCell className="font-medium">{evaluation.evaluationId}</TableCell>
                      <TableCell>{evaluation.dossierId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">v{evaluation.version}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{evaluation.evaluationType}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            evaluation.finalRiskLevel === "BAJO"
                              ? "default"
                              : evaluation.finalRiskLevel === "MEDIO"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {evaluation.finalRiskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            evaluation.status === "APPROVED"
                              ? "default"
                              : evaluation.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {evaluation.status === "APPROVED"
                            ? "Aprobada"
                            : evaluation.status === "REJECTED"
                              ? "Rechazada"
                              : evaluation.status === "PENDING_APPROVAL"
                                ? "Pendiente"
                                : "Borrador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {evaluation.evaluatorName || evaluation.evaluatorUserId}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(evaluation.evaluationDate).toLocaleDateString("es-VE")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/riesgo/resultado?evaluationId=${evaluation.evaluationId}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          El historial de evaluaciones mantiene un registro completo de todas las versiones para fines de auditoría y
          cumplimiento regulatorio. Los cambios en los niveles de riesgo quedan documentados automáticamente.
        </AlertDescription>
      </Alert>
    </div>
  )
}
