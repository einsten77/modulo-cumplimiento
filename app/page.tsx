"use client"

import Link from "next/link"
import { FileText, Clock, AlertTriangle, CheckCircle, Search, FileSearch, Users, Bell, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("sagra_token")
    if (token) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/images/logo-occidental.png" alt="La Occidental" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  SAGRA - Sistema Automatizado de Gestión de Riesgos
                </h1>
                <p className="text-sm text-muted-foreground">C.A. de Seguros la Occidental - Regulado por SUDEASEG</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Oficial de Cumplimiento</p>
              <p className="text-xs text-muted-foreground">Cristina Uzcategui</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Panel de Control SAGRA</h2>
          <p className="text-muted-foreground">Sistema Automatizado de Gestión de Riesgos y Cumplimiento</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Documentos Vencidos</CardTitle>
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">12</div>
              <p className="text-xs text-muted-foreground mt-1">Requieren atención inmediata</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-warning/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Próximos a Vencer</CardTitle>
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">8</div>
              <p className="text-xs text-muted-foreground mt-1">Vencen en los próximos 30 días</p>
            </CardContent>
          </Card>

          <Card className="border-info/20 bg-info/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Pendientes Aprobación</CardTitle>
                <FileText className="h-5 w-5 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">24</div>
              <p className="text-xs text-muted-foreground mt-1">Requieren revisión de Cumplimiento</p>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-success/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Documentos Aprobados</CardTitle>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">156</div>
              <p className="text-xs text-muted-foreground mt-1">Expedientes en cumplimiento</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Módulo de Debida Diligencia y Gestión Documental
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/documentos">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Lista de Documentos</CardTitle>
                    <CardDescription>Consultar documentos por expediente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Visualice el estado y seguimiento de todos los documentos cargados en el sistema
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/carga-documento">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Carga de Documentos</CardTitle>
                    <CardDescription>Agregar nuevos documentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Cargue documentos con fecha de vencimiento y observaciones según su rol
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/revision">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Revisión y Aprobación</CardTitle>
                    <CardDescription>Módulo de Cumplimiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Revise, observe o apruebe documentos con trazabilidad completa
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/alertas">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Alertas Documentales</CardTitle>
                    <CardDescription>Vencimientos y seguimiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gestione alertas automáticas de vencimientos y documentos observados
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/auditoria">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Historial de Auditoría</CardTitle>
                    <CardDescription>Trazabilidad completa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Consulte el historial completo de modificaciones y aprobaciones
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/reportes">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Reportes SUDEASEG</CardTitle>
                    <CardDescription>Evidencia regulatoria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Genere reportes para inspección de SUDEASEG con evidencia documental
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Módulo de Screening - Listas Nacionales e Internacionales
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/screening/ejecutar">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileSearch className="h-5 w-5 text-primary" />
                      Ejecutar Screening
                    </CardTitle>
                    <CardDescription>Consultar listas restrictivas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Consulte personas y empresas contra listas de ONU, OFAC, UE, UNIF y GAFI
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/screening/resultados">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Resultados de Screening</CardTitle>
                    <CardDescription>Análisis de coincidencias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Revise coincidencias detectadas con porcentaje de similitud y nivel de riesgo
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/screening/decision">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Decisión de Cumplimiento</CardTitle>
                    <CardDescription>Oficial de Cumplimiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Documente decisiones sobre coincidencias detectadas con justificación completa
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/screening/historial">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Historial de Screening</CardTitle>
                    <CardDescription>Auditoría y trazabilidad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Consulte el historial completo de screenings y decisiones adoptadas
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Módulo de Gestión de Personas Expuestas Políticamente (PEP)
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/pep/identificacion">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Identificación PEP
                    </CardTitle>
                    <CardDescription>Declarar condición PEP</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Identifique y clasifique PEP actuales, históricos y vinculados según GAFI
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/pep/detalle">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Detalle PEP</CardTitle>
                    <CardDescription>Información completa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Registre cargo público, fechas, fuentes de información y documentación de respaldo
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/pep/historial">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Historial PEP</CardTitle>
                    <CardDescription>Trazabilidad y versionamiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Consulte el historial completo de cambios de condición PEP con auditoría
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/pep/integracion">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Integración con Riesgo</CardTitle>
                    <CardDescription>Impacto en evaluación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Visualice el impacto automático en evaluación de riesgo y diligencia reforzada
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Módulo de Alertas, Seguimiento y Gestión de Casos
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/casos/bandeja">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Bandeja de Alertas
                    </CardTitle>
                    <CardDescription>Todas las alertas del sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Centralice y gestione todas las alertas generadas por el sistema SAGRA
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/casos/detalle">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Detalle de Alerta</CardTitle>
                    <CardDescription>Información completa del caso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Visualice el detalle completo, motivo y origen de cada alerta generada
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/casos/seguimiento">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Seguimiento de Caso</CardTitle>
                    <CardDescription>Registro cronológico de acciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Documente acciones, comentarios y cambios de estado con trazabilidad
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/casos/cierre">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Cierre de Alerta</CardTitle>
                    <CardDescription>Oficial de Cumplimiento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Cierre documentado de alertas con justificación y clasificación obligatoria
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Módulo de Auditoría, Bitácora Inmutable y Vista Regulador
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/auditoria/bitacora">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Bitácora de Auditoría
                    </CardTitle>
                    <CardDescription>Registro inmutable de eventos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Consulte el registro cronológico completo de todos los eventos del sistema
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/auditoria/detalle">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Detalle del Evento</CardTitle>
                    <CardDescription>Información completa del evento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Visualice datos previos, posteriores y justificaciones de cada evento registrado
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/auditoria/regulador">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full border-warning/20 bg-warning/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Vista Regulador</CardTitle>
                    <CardDescription>Acceso SUDEASEG (solo lectura)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Interfaz especial para inspectores de SUDEASEG con acceso consolidado
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/auditoria/exportacion">
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Exportación de Evidencia</CardTitle>
                    <CardDescription>Generación de reportes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Exporte evidencia regulatoria en formatos PDF y CSV con trazabilidad
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
