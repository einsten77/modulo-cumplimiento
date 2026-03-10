"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Send, AlertTriangle, Info } from "lucide-react"
import { RiskFactorCard } from "@/components/risk/risk-factor-card"
import type { RiskFactor, RiskLevel, CreateEvaluationRequest } from "@/types/risk-evaluation"

const RISK_FACTORS_TEMPLATE: RiskFactor[] = [
  {
    factorId: "producto",
    factorName: "Producto",
    description: "Tipo de producto o servicio contratado",
    weight: 0,
    observation: "",
    requiresObservation: false,
  },
  {
    factorId: "canal",
    factorName: "Canal de Distribución",
    description: "Medio por el cual se comercializó el producto",
    weight: 0,
    observation: "",
    requiresObservation: false,
  },
  {
    factorId: "ubicacion",
    factorName: "Ubicación Geográfica",
    description: "Ubicación del cliente y operaciones",
    weight: 0,
    observation: "",
    requiresObservation: false,
  },
  {
    factorId: "fondos",
    factorName: "Origen de Fondos",
    description: "Fuente de los recursos del cliente",
    weight: 0,
    observation: "",
    requiresObservation: false,
  },
  {
    factorId: "beneficiario",
    factorName: "Beneficiario Final",
    description: "Identificación y transparencia del beneficiario final",
    weight: 0,
    observation: "",
    requiresObservation: false,
  },
  {
    factorId: "pep",
    factorName: "Condición PEP",
    description: "Persona Expuesta Políticamente",
    weight: 0,
    observation: "",
    requiresObservation: false,
  },
  {
    factorId: "controles",
    factorName: "Controles Internos",
    description: "Efectividad de controles aplicados",
    weight: 0,
    observation: "",
    requiresObservation: false,
  },
]

export default function EvaluacionRiesgoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, checkPermission } = useAuth()

  const dossierId = searchParams.get("dossierId")
  const dossierName = searchParams.get("dossierName")

  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(RISK_FACTORS_TEMPLATE)
  const [generalComments, setGeneralComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreate = checkPermission("risk:evaluation:create")
  const canUpdate = checkPermission("risk:evaluation:update")

  useEffect(() => {
    if (!dossierId) {
      setError("No se especificó un expediente válido")
    }
  }, [dossierId])

  const calculateRiskLevel = (totalScore: number): RiskLevel => {
    const avgScore = totalScore / riskFactors.length
    if (avgScore <= 1.5) return "BAJO"
    if (avgScore <= 3.5) return "MEDIO"
    return "ALTO"
  }

  const getTotalScore = () => {
    return riskFactors.reduce((sum, factor) => sum + factor.weight, 0)
  }

  const getPreliminaryRiskLevel = (): RiskLevel => {
    return calculateRiskLevel(getTotalScore())
  }

  const handleFactorChange = (factorId: string, weight: number, observation: string) => {
    setRiskFactors((prev) =>
      prev.map((factor) =>
        factor.factorId === factorId
          ? {
              ...factor,
              weight,
              observation,
              requiresObservation: weight >= 4,
            }
          : factor,
      ),
    )
  }

  const validateForm = (): boolean => {
    // Check if high-risk factors have observations
    const missingObservations = riskFactors.filter((factor) => factor.weight >= 4 && !factor.observation.trim())

    if (missingObservations.length > 0) {
      setError(
        `Los factores con ponderación 4 o 5 requieren observaciones obligatorias: ${missingObservations
          .map((f) => f.factorName)
          .join(", ")}`,
      )
      return false
    }

    return true
  }

  const handleSaveDraft = async () => {
    if (!dossierId || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const request: CreateEvaluationRequest = {
        dossierId,
        evaluationType: "INICIAL",
        riskFactors,
        userId: user.id,
        comments: generalComments,
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/risk-evaluations/dossiers/${dossierId}/initial`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
          },
          body: JSON.stringify(request),
        },
      )

      if (!response.ok) {
        throw new Error("Error al guardar el borrador")
      }

      const data = await response.json()
      router.push(`/riesgo/resultado?evaluationId=${data.evaluationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    await handleSaveDraft()
  }

  if (!canCreate && !canUpdate) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tiene permisos para crear evaluaciones de riesgo. Contacte al Oficial de Cumplimiento.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const riskLevel = getPreliminaryRiskLevel()
  const totalScore = getTotalScore()
  const maxScore = riskFactors.length * 5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-semibold text-foreground">Evaluación de Riesgo</h1>
          </div>
          <p className="text-muted-foreground">
            Sistema Integral de Administración de Riesgos - Enfoque Basado en Riesgo (EBR)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dossier Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del Expediente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Expediente:</span>
            <span className="font-medium">{dossierId || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nombre:</span>
            <span className="font-medium">{dossierName || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Evaluador:</span>
            <span className="font-medium">{user?.fullName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Risk Score Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Puntaje Total</p>
              <p className="text-3xl font-bold">
                {totalScore} <span className="text-lg text-muted-foreground">/ {maxScore}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Nivel Preliminar</p>
              <Badge
                variant={riskLevel === "BAJO" ? "default" : riskLevel === "MEDIO" ? "secondary" : "destructive"}
                className="text-sm px-3 py-1"
              >
                {riskLevel}
              </Badge>
            </div>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              El nivel de riesgo se calcula automáticamente según la ponderación de factores.
              {riskLevel !== "BAJO" && (
                <> Las evaluaciones de riesgo Medio o Alto requieren aprobación del Oficial de Cumplimiento.</>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Factores de Riesgo</h2>
        <p className="text-sm text-muted-foreground">
          Evalúe cada factor de riesgo con una ponderación de 0 (sin riesgo) a 5 (riesgo crítico). Los valores 4 y 5
          requieren observaciones obligatorias.
        </p>

        {riskFactors.map((factor) => (
          <RiskFactorCard key={factor.factorId} factor={factor} onChange={handleFactorChange} />
        ))}
      </div>

      {/* General Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios Generales</CardTitle>
          <CardDescription>Observaciones adicionales sobre la evaluación de riesgo</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ingrese comentarios adicionales sobre esta evaluación..."
            value={generalComments}
            onChange={(e) => setGeneralComments(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={handleSaveDraft} disabled={isSubmitting || !dossierId}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Borrador
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !dossierId}>
          <Send className="mr-2 h-4 w-4" />
          Enviar Evaluación
        </Button>
      </div>
    </div>
  )
}
