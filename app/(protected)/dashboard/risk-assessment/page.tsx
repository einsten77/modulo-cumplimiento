import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, History, FileText } from "lucide-react"

/**
 * Ruta del menú "Evaluación de Riesgo":
 * /dashboard/risk-assessment
 *
 * Importante: el layout de /dashboard ya renderiza el shell y el header.
 * Aquí solo se renderiza contenido para evitar duplicar menú.
 */
export default function DashboardRiskAssessmentPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Evaluación de Riesgo</h1>
          <p className="text-sm text-muted-foreground">
            Accede al historial de evaluaciones y consulta resultados. Para crear una evaluación nueva, selecciona un
            expediente.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial
            </CardTitle>
            <CardDescription>Buscar y consultar evaluaciones realizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/riesgo/historial">
              <Button className="w-full">Ver historial</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Nueva evaluación
            </CardTitle>
            <CardDescription>
              Se inicia desde un expediente (requiere dossierId). Aquí dejamos la referencia para el flujo existente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Tip: abre un expediente y usa la opción “Evaluación de Riesgo” para pasar los parámetros.
            </p>
            <Link href="/expedientes">
              <Button variant="outline" className="w-full">
                Ir a expedientes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resultados
            </CardTitle>
            <CardDescription>Los resultados se consultan por ID desde el flujo existente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/riesgo/historial">
              <Button variant="secondary" className="w-full">
                Buscar resultados
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
