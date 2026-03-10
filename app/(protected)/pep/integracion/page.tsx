import Link from "next/link"
import { ArrowLeft, AlertTriangle, TrendingUp, FileText, Shield, Eye, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function PepIntegrationPage() {
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
                <h1 className="text-2xl font-semibold text-foreground">
                  SIAR - Integración PEP con Evaluación de Riesgo
                </h1>
                <p className="text-sm text-muted-foreground">C.A. de Seguros la Occidental - Regulado por SUDEASEG</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Oficial de Cumplimiento</p>
              <p className="text-xs text-muted-foreground">María González</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-2">Integración PEP con Riesgo y Diligencia</h2>
          <p className="text-muted-foreground">
            Impacto automático de condición PEP en evaluación de riesgo y requisitos de diligencia reforzada
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-warning bg-warning/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                    <div>
                      <CardTitle>Cliente PEP Detectado - Riesgo Incrementado</CardTitle>
                      <CardDescription className="mt-1">Activación automática de protocolos reforzados</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-warning text-warning-foreground">PEP Actual</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Expediente: </span>
                    <span className="font-medium">EXP-2024-001234</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cliente: </span>
                    <span className="font-medium">Carlos Alberto Rodríguez Pérez</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cargo: </span>
                    <span className="font-medium">Ministro de Economía y Finanzas</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo: </span>
                    <span className="font-medium">PEP Nacional</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-destructive" />
                  Impacto en Evaluación de Riesgo
                </CardTitle>
                <CardDescription>Ajustes automáticos aplicados al perfil de riesgo del cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Nivel de Riesgo Base</span>
                      <Badge variant="secondary">Medio</Badge>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Evaluación inicial basada en actividad comercial y perfil transaccional
                    </p>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold">Incremento por Condición PEP</span>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Nivel de Riesgo Ajustado</span>
                      <Badge className="bg-destructive text-destructive-foreground">Alto</Badge>
                    </div>
                    <Progress value={85} className="h-2 bg-destructive/20" />
                    <p className="text-xs text-muted-foreground">
                      Incremento automático por condición PEP según matriz de riesgo institucional
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Factores de Incremento Aplicados:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Condición PEP Actual</p>
                        <p className="text-xs text-muted-foreground">
                          +25 puntos - Cliente actualmente en cargo público de alto nivel
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +25
                      </Badge>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Cargo de Alta Jerarquía</p>
                        <p className="text-xs text-muted-foreground">
                          +15 puntos - Nivel ministerial con control sobre recursos públicos
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +15
                      </Badge>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Sector Económico Sensible</p>
                        <p className="text-xs text-muted-foreground">
                          +10 puntos - Cargo relacionado con economía y finanzas públicas
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +10
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Requisitos de Debida Diligencia Reforzada (DDR)
                </CardTitle>
                <CardDescription>Medidas adicionales obligatorias activadas automáticamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">Documentación Adicional Obligatoria</p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Declaración jurada de origen de fondos</li>
                        <li>Declaración de patrimonio actualizada</li>
                        <li>Estados financieros personales (últimos 2 años)</li>
                        <li>Justificación de capacidad económica</li>
                        <li>Declaración de actividades comerciales</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">
                        5 documentos requeridos
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                    <Eye className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">Monitoreo Continuo Reforzado</p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Revisión trimestral obligatoria de operaciones</li>
                        <li>Screening mensual contra listas internacionales</li>
                        <li>Monitoreo de medios y fuentes públicas</li>
                        <li>Alertas automáticas por transacciones atípicas</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">
                        Frecuencia: Trimestral
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">Aprobaciones de Alto Nivel</p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Aprobación del Oficial de Cumplimiento para inicio de relación</li>
                        <li>Revisión de alta gerencia para operaciones significativas</li>
                        <li>Comité de Cumplimiento para renovaciones</li>
                        <li>Documentación de decisiones en actas</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">
                        Aprobación OC requerida
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground mb-1">Actualización Periódica</p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Actualización de información cada 6 meses (vs 12 meses estándar)</li>
                        <li>Verificación de vigencia de condición PEP</li>
                        <li>Renovación de declaraciones juradas</li>
                        <li>Re-evaluación de nivel de riesgo</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">
                        Cada 6 meses
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas Asociadas</CardTitle>
                <CardDescription>Notificaciones automáticas generadas por el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 border-l-4 border-warning pl-3 py-2">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Cliente PEP Detectado</p>
                      <p className="text-xs text-muted-foreground">
                        Se requiere aprobación del Oficial de Cumplimiento antes de continuar con la operación
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Fecha:</span> 15/12/2024 10:30
                      </p>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">Activa</Badge>
                  </div>

                  <div className="flex items-start gap-3 border-l-4 border-info pl-3 py-2">
                    <FileText className="h-5 w-5 text-info mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Documentación DDR Pendiente</p>
                      <p className="text-xs text-muted-foreground">
                        Se requieren 5 documentos adicionales para completar debida diligencia reforzada
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Fecha:</span> 15/12/2024 10:35
                      </p>
                    </div>
                    <Badge variant="secondary">Pendiente</Badge>
                  </div>

                  <div className="flex items-start gap-3 border-l-4 border-primary pl-3 py-2">
                    <Eye className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Monitoreo Reforzado Activado</p>
                      <p className="text-xs text-muted-foreground">
                        Próxima revisión trimestral programada para marzo 2025
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Fecha:</span> 15/12/2024 10:40
                      </p>
                    </div>
                    <Badge variant="secondary">Programada</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Resumen de Estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Condición PEP:</span>
                  <Badge className="bg-warning text-warning-foreground">PEP Actual</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Riesgo ajustado:</span>
                  <Badge className="bg-destructive text-destructive-foreground">Alto</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DDR aplicada:</span>
                  <Badge variant="default">Activa</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Alertas activas:</span>
                  <Badge variant="secondary">3</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado de Cumplimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Documentación DDR</span>
                    <span className="font-medium">2/5</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Aprobaciones</span>
                    <span className="font-medium">0/2</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Verificaciones</span>
                    <span className="font-medium">1/3</span>
                  </div>
                  <Progress value={33} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Normativa Aplicable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Recomendación GAFI 12:</p>
                <p>
                  Aplicar medidas de debida diligencia reforzada a las relaciones comerciales con personas expuestas
                  políticamente.
                </p>
                <p className="font-medium text-foreground mt-3">Recomendación GAFI 22:</p>
                <p>
                  Implementar sistemas de monitoreo continuo que permitan detectar operaciones inusuales en clientes
                  PEP.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones Disponibles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/pep/detalle">Ver Detalle PEP</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/pep/historial">Ver Historial</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/documentos">Cargar Documentos DDR</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/alertas">Ver Todas las Alertas</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-warning/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Recordatorio
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  La condición PEP genera requisitos automáticos de cumplimiento que deben satisfacerse antes de
                  continuar con cualquier operación. Toda decisión debe estar documentada y aprobada por el Oficial de
                  Cumplimiento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
