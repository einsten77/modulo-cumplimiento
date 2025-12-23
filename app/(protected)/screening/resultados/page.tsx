"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, AlertTriangle, FileText, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import type { ScreeningResult, MatchLevel } from "@/types/screening"

export default function ResultadosScreeningPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { checkPermission } = useAuth()

  const screeningId = searchParams.get("screeningId")

  const [screening, setScreening] = useState<ScreeningResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canRead = checkPermission("screening:read")

  useEffect(() => {
    if (screeningId) {
      fetchScreeningResults()
    }
  }, [screeningId])

  const fetchScreeningResults = async () => {
    if (!screeningId) return

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/screening/${screeningId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar resultados del screening")
      }

      const data = await response.json()
      setScreening(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  const getNivelColor = (nivel: MatchLevel) => {
    switch (nivel) {
      case "ALTO":
        return "bg-destructive text-destructive-foreground"
      case "MEDIO":
        return "bg-warning text-warning-foreground"
      case "BAJO":
        return "bg-muted text-muted-foreground"
    }
  }

  const getNivelIcon = (nivel: MatchLevel) => {
    switch (nivel) {
      case "ALTO":
        return <AlertTriangle className="h-4 w-4" />
      case "MEDIO":
        return <FileText className="h-4 w-4" />
      case "BAJO":
        return <CheckCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando resultados del screening...</p>
        </div>
      </div>
    )
  }

  if (!screening) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No se encontraron resultados del screening</AlertDescription>
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
            <h1 className="text-3xl font-semibold text-foreground">Resultados de Screening</h1>
          </div>
          <p className="text-muted-foreground">Análisis de coincidencias detectadas</p>
        </div>
        <Link href="/screening/ejecutar">
          <Button variant="outline">Nueva Consulta</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Expediente: {screening.dossierId}</CardTitle>
              <CardDescription className="mt-2 space-y-1">
                <div>
                  <span className="font-semibold">Sujeto evaluado:</span> {screening.subject.fullName}
                </div>
                <div>
                  <span className="font-semibold">Documento:</span> {screening.subject.documentType}-
                  {screening.subject.documentNumber}
                </div>
                <div>
                  <span className="font-semibold">Fecha de consulta:</span>{" "}
                  {new Date(screening.executionDate).toLocaleString("es-VE")}
                </div>
                <div>
                  <span className="font-semibold">Usuario:</span> {screening.executedBy}
                </div>
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-base px-4 py-2">
              {screening.selectedLists.length} listas consultadas
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Alert for matches */}
      {screening.matches.length > 0 ? (
        <Alert
          className={
            screening.highestMatchLevel === "ALTO"
              ? "border-destructive/50 bg-destructive/10"
              : "border-warning/50 bg-warning/10"
          }
        >
          <AlertTriangle
            className={`h-4 w-4 ${screening.highestMatchLevel === "ALTO" ? "text-destructive" : "text-warning"}`}
          />
          <AlertTitle className={screening.highestMatchLevel === "ALTO" ? "text-destructive" : "text-warning"}>
            {screening.matches.length} Coincidencias Detectadas
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Se encontraron coincidencias que requieren análisis del Oficial de Cumplimiento. Se ha generado una alerta
            automática en el sistema.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Sin Coincidencias</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            No se encontraron coincidencias en las listas consultadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {screening.matches.length > 0 && (
        <div className="space-y-4">
          {screening.matches.map((match) => (
            <Card
              key={match.matchId}
              className={`border-l-4 ${
                match.matchLevel === "ALTO"
                  ? "border-l-destructive"
                  : match.matchLevel === "MEDIO"
                    ? "border-l-warning"
                    : "border-l-muted"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{match.listName}</CardTitle>
                      <Badge className={getNivelColor(match.matchLevel)}>
                        {getNivelIcon(match.matchLevel)}
                        <span className="ml-1">{match.matchLevel}</span>
                      </Badge>
                    </div>
                    <CardDescription>Fecha de incorporación a la lista: {match.listIncorporationDate}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">{match.similarityPercentage}%</div>
                    <div className="text-xs text-muted-foreground">Coincidencia</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Nombre en la lista:</div>
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded font-mono">
                      {match.nameFound}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Documentos asociados:</div>
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {match.associatedDocuments}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">Análisis de coincidencia:</div>
                  <div className="text-sm text-muted-foreground">{match.matchDetails}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Algorithm Info */}
      <Card className="border-info/50 bg-info/5">
        <CardHeader>
          <CardTitle className="text-sm text-info-foreground">Algoritmo de Similitud: Jaro-Winkler</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • <strong>Alto (≥85%):</strong> Coincidencia muy probable. Requiere análisis inmediato.
          </p>
          <p>
            • <strong>Medio (70-84%):</strong> Coincidencia posible. Requiere verificación adicional.
          </p>
          <p>
            • <strong>Bajo (&lt;70%):</strong> Coincidencia poco probable. Se recomienda descarte justificado.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      {screening.matches.length > 0 && screening.status !== "DECIDED" && (
        <div className="flex justify-end">
          <Link href={`/screening/decision?screeningId=${screening.screeningId}`}>
            <Button size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Proceder a Decisión de Cumplimiento
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
