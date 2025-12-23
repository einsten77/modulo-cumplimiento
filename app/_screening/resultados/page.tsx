"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, FileText, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ResultadosScreeningPage() {
  const resultados = [
    {
      lista: "Lista OFAC",
      nombreEncontrado: "RODRIGUEZ GARCIA, Carlos Alberto",
      porcentaje: 92,
      nivel: "alto",
      detalles: "Coincidencia en nombre completo y nacionalidad venezolana",
      documentos: "Pasaporte: V-12345678",
      fechaIncorporacion: "15/03/2019",
    },
    {
      lista: "Lista Consolidada ONU",
      nombreEncontrado: "Carlos A. Rodriguez",
      porcentaje: 78,
      nivel: "medio",
      detalles: "Coincidencia parcial en nombre",
      documentos: "No disponible",
      fechaIncorporacion: "22/08/2020",
    },
    {
      lista: "Lista UNIF",
      nombreEncontrado: "Rodriguez, Carlos",
      porcentaje: 65,
      nivel: "bajo",
      detalles: "Coincidencia solo en apellido y primer nombre",
      documentos: "CI: E-8765432",
      fechaIncorporacion: "10/01/2021",
    },
  ]

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "alto":
        return "bg-destructive text-destructive-foreground"
      case "medio":
        return "bg-warning text-warning-foreground"
      case "bajo":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case "alto":
        return <AlertTriangle className="h-4 w-4" />
      case "medio":
        return <FileText className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
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
                <h1 className="text-xl font-semibold text-foreground">Resultados de Screening</h1>
                <p className="text-sm text-muted-foreground">Análisis de coincidencias detectadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/screening/ejecutar">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nueva Consulta
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Volver al Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Expediente: EXP-2024-001234</CardTitle>
                  <CardDescription className="mt-2">
                    <span className="font-semibold">Sujeto evaluado:</span> Carlos Alberto Rodriguez Garcia
                    <br />
                    <span className="font-semibold">Documento:</span> V-12345678
                    <br />
                    <span className="font-semibold">Fecha de consulta:</span> 15/12/2025 14:35:22
                    <br />
                    <span className="font-semibold">Usuario:</span> María González (Oficial de Cumplimiento)
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-base px-4 py-2">
                  5 listas consultadas
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Alert className="mb-6 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">3 Coincidencias Detectadas</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Se encontraron coincidencias que requieren análisis del Oficial de Cumplimiento. Se ha generado una alerta
            automática en el sistema.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {resultados.map((resultado, index) => (
            <Card
              key={index}
              className={`border-l-4 ${
                resultado.nivel === "alto"
                  ? "border-l-destructive"
                  : resultado.nivel === "medio"
                    ? "border-l-warning"
                    : "border-l-muted"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{resultado.lista}</CardTitle>
                      <Badge className={getNivelColor(resultado.nivel)}>
                        {getNivelIcon(resultado.nivel)}
                        <span className="ml-1 uppercase">{resultado.nivel}</span>
                      </Badge>
                    </div>
                    <CardDescription>Fecha de incorporación a la lista: {resultado.fechaIncorporacion}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">{resultado.porcentaje}%</div>
                    <div className="text-xs text-muted-foreground">Coincidencia</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Nombre en la lista:</div>
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded font-mono">
                      {resultado.nombreEncontrado}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-1">Documentos asociados:</div>
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">{resultado.documentos}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-1">Análisis de coincidencia:</div>
                  <div className="text-sm text-muted-foreground">{resultado.detalles}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-sm text-warning-foreground">Algoritmo de Similitud: Jaro-Winkler</CardTitle>
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

        <div className="flex justify-end mt-6">
          <Link href="/screening/decision">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <FileText className="h-4 w-4 mr-2" />
              Proceder a Decisión de Cumplimiento
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
