import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, FileText, History } from "lucide-react"

/**
 * Ruta del menú "Screening":
 * /dashboard/screening
 *
 * Nota: el layout de /dashboard ya renderiza el shell y el header.
 * Aquí solo se renderiza contenido para evitar duplicar menú.
 */
export default function DashboardScreeningPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Screening</h1>
        <p className="text-sm text-muted-foreground">
          Consultas y verificaciones para sujetos (clientes, intermediarios, empleados, proveedores, etc.).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Nueva consulta
            </CardTitle>
            <CardDescription>Iniciar un proceso de screening.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/screening">
              <Button className="w-full">Ir a Screening</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial
            </CardTitle>
            <CardDescription>Ver consultas realizadas (si aplica en el flujo existente).</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/screening">
              <Button variant="secondary" className="w-full">
                Ver historial
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reportes
            </CardTitle>
            <CardDescription>Acceso a reportes del módulo (si aplica).</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reportes">
              <Button variant="outline" className="w-full">
                Ir a reportes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
