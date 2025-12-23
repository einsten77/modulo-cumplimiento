import Link from "next/link"
import { ArrowLeft, Search, Filter, Download, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function HistorialScreeningPage() {
  const historial = [
    {
      id: "SCR-2024-0234",
      fecha: "15/12/2025 14:35:22",
      expediente: "EXP-2024-001234",
      sujeto: "Carlos Alberto Rodriguez Garcia",
      documento: "V-12345678",
      coincidencias: 3,
      nivelMaximo: "alto",
      decision: "seguimiento",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
    },
    {
      id: "SCR-2024-0233",
      fecha: "15/12/2025 10:15:08",
      expediente: "EXP-2024-001198",
      sujeto: "Inversiones ABC C.A.",
      documento: "J-40123456-7",
      coincidencias: 0,
      nivelMaximo: null,
      decision: "sin_coincidencias",
      usuario: "Pedro Ramírez",
      rol: "Analista de Cumplimiento",
    },
    {
      id: "SCR-2024-0232",
      fecha: "14/12/2025 16:42:33",
      expediente: "EXP-2024-001187",
      sujeto: "Ana María Fernández López",
      documento: "V-23456789",
      coincidencias: 1,
      nivelMaximo: "bajo",
      decision: "descartada",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
    },
    {
      id: "SCR-2024-0231",
      fecha: "14/12/2025 11:20:15",
      expediente: "EXP-2024-001165",
      sujeto: "José Luis Martínez",
      documento: "V-18765432",
      coincidencias: 2,
      nivelMaximo: "alto",
      decision: "relevante",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
    },
    {
      id: "SCR-2024-0230",
      fecha: "13/12/2025 15:33:47",
      expediente: "EXP-2024-001142",
      sujeto: "Comercializadora XYZ S.A.",
      documento: "J-31987654-2",
      coincidencias: 1,
      nivelMaximo: "medio",
      decision: "descartada",
      usuario: "Pedro Ramírez",
      rol: "Analista de Cumplimiento",
    },
  ]

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "descartada":
        return <Badge className="bg-success text-success-foreground">Descartada</Badge>
      case "relevante":
        return <Badge className="bg-destructive text-destructive-foreground">Relevante - Bloqueado</Badge>
      case "seguimiento":
        return <Badge className="bg-warning text-warning-foreground">En Seguimiento</Badge>
      case "sin_coincidencias":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Sin Coincidencias
          </Badge>
        )
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  const getNivelBadge = (nivel: string | null) => {
    if (!nivel) return null
    switch (nivel) {
      case "alto":
        return (
          <Badge variant="outline" className="border-destructive text-destructive">
            Alto
          </Badge>
        )
      case "medio":
        return (
          <Badge variant="outline" className="border-warning text-warning">
            Medio
          </Badge>
        )
      case "bajo":
        return (
          <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
            Bajo
          </Badge>
        )
      default:
        return null
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
                <h1 className="text-xl font-semibold text-foreground">Historial de Screening</h1>
                <p className="text-sm text-muted-foreground">Consultas realizadas y decisiones adoptadas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/screening/ejecutar">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Nuevo Screening
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6 border-info/50 bg-info/10">
          <Eye className="h-4 w-4 text-info" />
          <AlertTitle className="text-info-foreground">Trazabilidad y Auditoría</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Este historial contiene todas las consultas de screening realizadas en el sistema. Los registros son
            inmutables y están disponibles para auditoría permanente de SUDEASEG.
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filtros de Búsqueda</CardTitle>
                <CardDescription>Busque consultas por expediente, documento o sujeto</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Historial
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por expediente..." className="pl-9" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por documento..." className="pl-9" />
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultas Realizadas</CardTitle>
            <CardDescription>Mostrando {historial.length} consultas más recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historial.map((registro) => (
                <div key={registro.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-foreground">{registro.id}</span>
                        {getDecisionBadge(registro.decision)}
                        {registro.nivelMaximo && getNivelBadge(registro.nivelMaximo)}
                      </div>
                      <div className="text-sm text-muted-foreground">{registro.fecha}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Expediente</div>
                      <div className="font-semibold text-foreground font-mono">{registro.expediente}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Sujeto Evaluado</div>
                      <div className="font-semibold text-foreground">{registro.sujeto}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Documento</div>
                      <div className="font-semibold text-foreground font-mono">{registro.documento}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {registro.coincidencias} coincidencias detectadas
                      </span>{" "}
                      - Procesado por {registro.usuario} ({registro.rol})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Siguiente
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
