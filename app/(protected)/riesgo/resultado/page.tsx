"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, Clock } from "lucide-react"
import { RiskFactorCard } from "@/components/risk/risk-factor-card"
import type { RiskEvaluation } from "@/types/risk-evaluation"

export default function ResultadoEvaluacionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, checkPermission } = useAuth()

  const evaluationId = searchParams.get("evaluationId")

  const [evaluation, setEvaluation] = useState<RiskEvaluation | null>(null)
  const [approvalComments, setApprovalComments] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canApprove = checkPermission("risk:evaluation:approve")
  const canRead = checkPermission("risk:evaluation:read")

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluation()
    }
  }, [evaluationId])

  const fetchEvaluation = async () => {
    if (!evaluationId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/risk-evaluations/${evaluationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar la evaluación")
      }

      const data = await response.json()
      setEvaluation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!evaluationId || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/risk-evaluations/${evaluationId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
            "X-User-Id": user.id,
          },
          body: JSON.stringify(approvalComments),
        },
      )

      if (!response.ok) {
        throw new Error("Error al aprobar la evaluación")
      }

      await fetchEvaluation()
      setApprovalComments("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!evaluationId || !user || !rejectionReason.trim()) {
      setError("Debe especificar un motivo de rechazo")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/risk-evaluations/${evaluationId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
            "X-User-Id": user.id,
          },
          body: JSON.stringify(rejectionReason),
        },
      )

      if (!response.ok) {
        throw new Error("Error al rechazar la evaluación")
      }

      await fetchEvaluation()
      setRejectionReason("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Clock className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No se encontró la evaluación solicitada</AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalScore = evaluation.riskFactors.reduce((sum, f) => sum + f.weight, 0)
  const maxScore = evaluation.riskFactors.length * 5
  const avgScore = totalScore / evaluation.riskFactors.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-semibold text-foreground">Resultado de Evaluación de Riesgo</h1>
          </div>
          <p className="text-muted-foreground">Revisión y aprobación de evaluación - Enfoque Basado en Riesgo (EBR)</p>
        </div>
        <Badge
          variant={
            evaluation.status === "APPROVED"
              ? "default"
              : evaluation.status === "REJECTED"
                ? "destructive"
                : "secondary"
          }
          className="text-sm px-3 py-1"
        >
          {evaluation.status === "APPROVED"
            ? "Aprobada"
            : evaluation.status === "REJECTED"
              ? "Rechazada"
              : evaluation.status === "PENDING_APPROVAL"
                ? "Pendiente Aprobación"
                : "Borrador"}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Status Alert */}
      {evaluation.finalRiskLevel !== "BAJO" && evaluation.status !== "APPROVED" && (
        <Alert variant={evaluation.finalRiskLevel === "ALTO" ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nivel de Riesgo {evaluation.finalRiskLevel}</AlertTitle>
          <AlertDescription>
            Esta evaluación de riesgo {evaluation.finalRiskLevel.toLowerCase()} requiere aprobación del Oficial de
            Cumplimiento antes de entrar en vigencia. El sistema ha generado una alerta automática.
          </AlertDescription>
        </Alert>
      )}

      {/* Evaluation Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la Evaluación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">ID de Evaluación:</span>
              <p className="font-medium">{evaluation.evaluationId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Expediente:</span>
              <p className="font-medium">{evaluation.dossierId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Versión:</span>
              <p className="font-medium">v{evaluation.version}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <p className="font-medium">{evaluation.evaluationType}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Evaluador:</span>
              <p className="font-medium">{evaluation.evaluatorName || evaluation.evaluatorUserId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Fecha:</span>
              <p className="font-medium">{new Date(evaluation.evaluationDate).toLocaleDateString("es-VE")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Result */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Resultado Final de Riesgo</CardTitle>
          <CardDescription>Cálculo automático basado en ponderación de factores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Puntaje Total</p>
              <p className="text-4xl font-bold">
                {totalScore}
                <span className="text-xl text-muted-foreground">/{maxScore}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Promedio</p>
              <p className="text-4xl font-bold">{avgScore.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Nivel de Riesgo</p>
              <Badge
                variant={
                  evaluation.finalRiskLevel === "BAJO"
                    ? "default"
                    : evaluation.finalRiskLevel === "MEDIO"
                      ? "secondary"
                      : "destructive"
                }
                className="text-2xl px-6 py-2 font-bold"
              >
                {evaluation.finalRiskLevel}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Justification */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Justificación del Resultado</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El nivel de riesgo <strong>{evaluation.finalRiskLevel}</strong> se determinó automáticamente según el
              sistema de ponderación institucional. Con un puntaje promedio de <strong>{avgScore.toFixed(2)}</strong>{" "}
              sobre 5, el expediente presenta un perfil de riesgo que requiere{" "}
              {evaluation.finalRiskLevel === "BAJO"
                ? "controles estándar de diligencia debida"
                : evaluation.finalRiskLevel === "MEDIO"
                  ? "monitoreo reforzado y controles adicionales"
                  : "diligencia debida reforzada (EDD) y monitoreo continuo"}
              .
            </p>
          </div>

          {evaluation.hasManualOverride && (
            <>
              <Separator />
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Override Manual Aplicado</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Aplicado por: <strong>{evaluation.overrideAppliedBy}</strong>
                  </p>
                  <p className="text-sm">{evaluation.manualOverrideJustification}</p>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Risk Factors Summary */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Resumen de Factores de Riesgo</h2>
        {evaluation.riskFactors.map((factor) => (
          <RiskFactorCard key={factor.factorId} factor={factor} onChange={() => {}} readonly={true} />
        ))}
      </div>

      {/* Comments */}
      {evaluation.comments && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comentarios del Evaluador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-wrap">{evaluation.comments}</p>
          </CardContent>
        </Card>
      )}

      {/* Approval Section */}
      {canApprove && evaluation.status === "PENDING_APPROVAL" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Aprobación de Evaluación</CardTitle>
            <CardDescription>Como Oficial de Cumplimiento, debe aprobar o rechazar esta evaluación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comments">Comentarios de Aprobación (Opcional)</Label>
              <Textarea
                id="approval-comments"
                placeholder="Comentarios adicionales sobre la aprobación..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Motivo de Rechazo</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Si rechaza, debe especificar el motivo..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobar Evaluación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Info */}
      {evaluation.status === "APPROVED" && evaluation.approvedBy && (
        <Card className="border-success">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Evaluación Aprobada</p>
                <p className="text-sm text-muted-foreground">
                  Aprobada por <strong>{evaluation.approvedBy}</strong> el{" "}
                  {evaluation.approvedAt && new Date(evaluation.approvedAt).toLocaleString("es-VE")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {evaluation.status === "REJECTED" && evaluation.rejectionReason && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Evaluación Rechazada</p>
                <p className="text-sm text-muted-foreground">{evaluation.rejectionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <Button variant="outline" onClick={() => router.push("/riesgo/historial")}>
          <FileText className="mr-2 h-4 w-4" />
          Ver Historial
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    </div>
  )
}
