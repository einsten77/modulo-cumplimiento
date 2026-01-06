export const dynamic = "force-dynamic"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const alertasVencidos = [
  {
    id: "DOC-001",
    tipo: "RIF",
    entidad: "Seguros Alfa, C.A.",
    expediente: "CLI-2024-001",
    fechaVencimiento: "2024-11-30",
    diasVencido: 15,
  },
  {
    id: "DOC-007",
    tipo: "Comprobante Domicilio",
    entidad: "Laura Sánchez",
    expediente: "EMP-2024-018",
    fechaVencimiento: "2024-04-20",
    diasVencido: 235,
  },
]

const alertasProximosVencer = [
  {
    id: "DOC-002",
    tipo: "Estados Financieros",
    entidad: "Proveedora Beta, S.A.",
    expediente: "PROV-2024-015",
    fechaVencimiento: "2025-01-10",
    diasRestantes: 26,
  },
]

const alertasObservados = [
  {
    id: "DOC-005",
    tipo: "Licencia SUDEASEG",
    entidad: "Corredor Delta",
    expediente: "INT-2024-023",
    fechaObservacion: "2024-11-08",
    diasSinCorregir: 37,
    observacion: "Documento presenta fecha ilegible. Se requiere copia más clara.",
  },
]

export default function AlertasPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Alertas Documentales</h1>
              <p className="text-sm text-muted-foreground">Seguimiento de vencimientos y observaciones</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Documentos Vencidos Críticos</AlertTitle>
            <AlertDescription>
              Hay {alertasVencidos.length} documentos vencidos que requieren acción inmediata. Esto representa un riesgo
              de cumplimiento regulatorio ante SUDEASEG.
            </AlertDescription>
          </Alert>

          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-destructive">Documentos Vencidos</CardTitle>
                  <CardDescription>Requieren renovación inmediata</CardDescription>
                </div>
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  {alertasVencidos.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertasVencidos.map((doc) => (
                <div key={doc.id} className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{doc.tipo}</h3>
                        <Badge variant="destructive" className="text-xs">
                          Vencido hace {doc.diasVencido} días
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.entidad}</p>
                      <p className="text-xs text-muted-foreground">Expediente: {doc.expediente}</p>
                    </div>
                    <Button size="sm" variant="destructive">
                      Gestionar
                    </Button>
                  </div>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Fecha de vencimiento:</span>{" "}
                    {new Date(doc.fechaVencimiento).toLocaleDateString("es-VE")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-warning/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-warning">Documentos Próximos a Vencer</CardTitle>
                  <CardDescription>Vencen en los próximos 30 días</CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2 border-warning text-warning">
                  {alertasProximosVencer.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertasProximosVencer.map((doc) => (
                <div key={doc.id} className="p-4 rounded-lg border border-warning/20 bg-warning/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{doc.tipo}</h3>
                        <Badge variant="outline" className="text-xs border-warning text-warning">
                          <Clock className="h-3 w-3 mr-1" />
                          Vence en {doc.diasRestantes} días
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.entidad}</p>
                      <p className="text-xs text-muted-foreground">Expediente: {doc.expediente}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Renovar
                    </Button>
                  </div>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Fecha de vencimiento:</span>{" "}
                    {new Date(doc.fechaVencimiento).toLocaleDateString("es-VE")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documentos Observados Sin Corrección</CardTitle>
                  <CardDescription>Documentos que requieren acción del usuario</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {alertasObservados.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertasObservados.map((doc) => (
                <div key={doc.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{doc.tipo}</h3>
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {doc.diasSinCorregir} días sin corregir
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.entidad}</p>
                      <p className="text-xs text-muted-foreground">Expediente: {doc.expediente}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver Detalle
                    </Button>
                  </div>
                  <div className="mt-3 p-3 rounded bg-muted">
                    <p className="text-sm">
                      <span className="font-medium">Observación:</span> {doc.observacion}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Observado el: {new Date(doc.fechaObservacion).toLocaleDateString("es-VE")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 rounded-lg bg-muted">
          <h3 className="font-semibold mb-3">Comportamiento de Alertas Automáticas</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Las alertas se generan automáticamente 30 días antes del vencimiento</li>
            <li>• Los documentos vencidos se marcan como críticos y requieren acción inmediata</li>
            <li>• Las alertas de documentos observados se generan después de 7 días sin corrección</li>
            <li>• Todas las alertas se notifican diariamente al Oficial de Cumplimiento</li>
            <li>• El sistema genera reportes automáticos para SUDEASEG sobre documentos vencidos</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
