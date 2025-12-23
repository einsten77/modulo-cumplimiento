"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, AlertCircle, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DecisionCumplimientoPage() {
  const [decision, setDecision] = useState<string>("")

  const resultadoResumen = {
    expediente: "EXP-2024-001234",
    sujeto: "Carlos Alberto Rodriguez Garcia",
    documento: "V-12345678",
    fecha: "15/12/2025 14:35:22",
    coincidencias: 3,
    nivelMaximo: "alto",
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
                <h1 className="text-xl font-semibold text-foreground">Decisión de Cumplimiento</h1>
                <p className="text-sm text-muted-foreground">Módulo exclusivo - Oficial de Cumplimiento</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/screening/resultados">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ver Resultados
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

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Alert className="mb-6 border-info/50 bg-info/10">
          <AlertCircle className="h-4 w-4 text-info" />
          <AlertTitle className="text-info-foreground">Control de Acceso</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Esta pantalla es de uso exclusivo del Oficial de Cumplimiento. Toda decisión adoptada queda registrada
            permanentemente en la auditoría del sistema.
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Resultado Consolidado del Screening
            </CardTitle>
            <CardDescription>Resumen de las coincidencias detectadas en el proceso de screening</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Expediente</div>
                <div className="font-semibold text-foreground font-mono">{resultadoResumen.expediente}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Fecha de Screening</div>
                <div className="font-semibold text-foreground">{resultadoResumen.fecha}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Sujeto Evaluado</div>
                <div className="font-semibold text-foreground">{resultadoResumen.sujeto}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Documento de Identidad</div>
                <div className="font-semibold text-foreground font-mono">{resultadoResumen.documento}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total de Coincidencias</div>
                <div className="text-2xl font-bold text-foreground">{resultadoResumen.coincidencias}</div>
              </div>
              <Badge className="bg-destructive text-destructive-foreground text-base px-4 py-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                Nivel Máximo: ALTO
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Decisión del Oficial de Cumplimiento</CardTitle>
            <CardDescription>Seleccione la decisión adoptada y justifique su análisis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipo de Decisión *</Label>
              <div className="space-y-2">
                <div
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    decision === "descartada"
                      ? "border-success bg-success/10"
                      : "border-border hover:border-success/50 hover:bg-success/5"
                  }`}
                  onClick={() => setDecision("descartada")}
                >
                  <input
                    type="radio"
                    id="descartada"
                    name="decision"
                    value="descartada"
                    checked={decision === "descartada"}
                    onChange={(e) => setDecision(e.target.value)}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <Label htmlFor="descartada" className="cursor-pointer font-semibold text-base">
                      Coincidencia Descartada
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Las coincidencias detectadas no corresponden al sujeto evaluado. Se puede proceder con la
                      operación.
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    decision === "relevante"
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50 hover:bg-destructive/5"
                  }`}
                  onClick={() => setDecision("relevante")}
                >
                  <input
                    type="radio"
                    id="relevante"
                    name="decision"
                    value="relevante"
                    checked={decision === "relevante"}
                    onChange={(e) => setDecision(e.target.value)}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <Label htmlFor="relevante" className="cursor-pointer font-semibold text-base">
                      Coincidencia Relevante - Bloqueo
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Las coincidencias detectadas corresponden al sujeto evaluado. Se RECHAZA la operación por estar en
                      listas restrictivas.
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    decision === "seguimiento"
                      ? "border-warning bg-warning/10"
                      : "border-border hover:border-warning/50 hover:bg-warning/5"
                  }`}
                  onClick={() => setDecision("seguimiento")}
                >
                  <input
                    type="radio"
                    id="seguimiento"
                    name="decision"
                    value="seguimiento"
                    checked={decision === "seguimiento"}
                    onChange={(e) => setDecision(e.target.value)}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <Label htmlFor="seguimiento" className="cursor-pointer font-semibold text-base">
                      Caso en Seguimiento
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Las coincidencias requieren investigación adicional. Se mantiene en monitoreo continuo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificacion" className="text-base font-semibold">
                Justificación de la Decisión *
              </Label>
              <Textarea
                id="justificacion"
                placeholder="Describa de manera detallada el análisis realizado y los fundamentos de su decisión. Esta justificación quedará registrada para auditoría de SUDEASEG."
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 100 caracteres. Incluya referencias a documentación revisada, análisis comparativo y base
                normativa.
              </p>
            </div>

            <Alert className="border-warning/50 bg-warning/5">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning-foreground">Consideraciones Importantes</AlertTitle>
              <AlertDescription className="text-muted-foreground text-sm space-y-1">
                <p>• Esta decisión es irreversible y queda registrada permanentemente.</p>
                <p>• Se generará un registro en el historial de auditoría con fecha, hora y usuario.</p>
                <p>• En caso de "Coincidencia Relevante", se bloqueará automáticamente el expediente.</p>
                <p>• La justificación debe ser clara y fundamentada según normativa SUDEASEG.</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/screening/resultados">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Resultados
            </Button>
          </Link>
          <Link href="/screening/historial">
            <Button size="lg" className="bg-primary hover:bg-primary/90" disabled={!decision}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Decisión
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
