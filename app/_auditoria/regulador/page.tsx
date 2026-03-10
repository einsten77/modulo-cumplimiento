"use client"
import { Shield, Eye, FileText, Search, Users, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VistaReguladorPage() {
  const expedientesResumen = [
    {
      codigo: "EXP-2024-045",
      nombre: "Juan Carlos Pérez Rodríguez",
      tipo: "Persona Natural",
      riesgo: "Bajo",
      estado: "Aprobado",
      ultimaActualizacion: "15/12/2024",
    },
    {
      codigo: "EXP-2024-044",
      nombre: "Corporación ABC, C.A.",
      tipo: "Persona Jurídica",
      riesgo: "Medio",
      estado: "En Revisión",
      ultimaActualizacion: "15/12/2024",
    },
    {
      codigo: "EXP-2024-043",
      nombre: "María Eugenia Gutiérrez",
      tipo: "Persona Natural",
      riesgo: "Alto",
      estado: "Seguimiento",
      ultimaActualizacion: "15/12/2024",
    },
  ]

  const alertasActivas = [
    {
      id: "ALT-2024-0235",
      tipo: "Documento Vencido",
      expediente: "EXP-2024-042",
      prioridad: "Alta",
      estado: "Pendiente",
    },
    {
      id: "ALT-2024-0234",
      tipo: "Coincidencia en Screening",
      expediente: "EXP-2024-045",
      prioridad: "Crítica",
      estado: "Cerrada",
    },
  ]

  const pepActivos = [
    {
      expediente: "EXP-2024-043",
      nombre: "María Eugenia Gutiérrez",
      condicion: "PEP Vinculado",
      cargo: "Familiar de Funcionario",
      fechaIdentificacion: "15/12/2024",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-4 border-[#fce809] bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#fce809]/20 rounded-lg">
                <Shield className="h-8 w-8 text-[#7f8083]" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Vista Regulador SUDEASEG - SIAR</h1>
                <p className="text-sm text-muted-foreground">
                  Superintendencia de Seguros de Venezuela - Acceso Solo Lectura
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-[#fce809] text-[#7f8083] text-base px-4 py-2">
                <Eye className="h-4 w-4 mr-2" />
                SUDEASEG - Solo Lectura
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-[#fce809] border-2">
          <CardHeader className="bg-[#fce809]/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-6 w-6 text-[#7f8083]" />
              Panel de Control SUDEASEG
            </CardTitle>
            <CardDescription className="text-base">
              C.A. de Seguros la Occidental - Sistema Integral de Administración de Riesgos y Cumplimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-[#00bf63]/20 bg-[#00bf63]/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Expedientes</CardTitle>
                    <FileText className="h-5 w-5 text-[#00bf63]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#00bf63]">156</div>
                  <p className="text-xs text-muted-foreground mt-1">Activos en el sistema</p>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">12</div>
                  <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
                </CardContent>
              </Card>

              <Card className="border-[#fce809]/20 bg-[#fce809]/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">PEP Identificados</CardTitle>
                    <Users className="h-5 w-5 text-[#7f8083]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#7f8083]">8</div>
                  <p className="text-xs text-muted-foreground mt-1">Con diligencia reforzada</p>
                </CardContent>
              </Card>

              <Card className="border-[#37ce48]/20 bg-[#37ce48]/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Screenings</CardTitle>
                    <Search className="h-5 w-5 text-[#37ce48]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#37ce48]">234</div>
                  <p className="text-xs text-muted-foreground mt-1">Ejecutados este mes</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="expedientes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-[#a6a6a6]/10">
            <TabsTrigger
              value="expedientes"
              className="data-[state=active]:bg-[#00bf63] data-[state=active]:text-white"
            >
              Expedientes
            </TabsTrigger>
            <TabsTrigger value="screening" className="data-[state=active]:bg-[#00bf63] data-[state=active]:text-white">
              Screening
            </TabsTrigger>
            <TabsTrigger value="pep" className="data-[state=active]:bg-[#00bf63] data-[state=active]:text-white">
              PEP
            </TabsTrigger>
            <TabsTrigger value="alertas" className="data-[state=active]:bg-[#00bf63] data-[state=active]:text-white">
              Alertas
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="data-[state=active]:bg-[#00bf63] data-[state=active]:text-white">
              Bitácora
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expedientes" className="space-y-6">
            <Card className="border-[#00bf63]/20">
              <CardHeader className="bg-[#00bf63]/5">
                <CardTitle>Consulta de Expedientes</CardTitle>
                <CardDescription>Visualice la información consolidada de todos los expedientes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Código de Expediente</label>
                    <Input placeholder="EXP-2024-XXX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nivel de Riesgo</label>
                    <Select defaultValue="todos">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="bajo">Bajo</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white">
                      <Search className="h-4 w-4" />
                      Buscar
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold">Código</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Nombre</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Tipo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Riesgo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Última Actualización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expedientesResumen.map((exp) => (
                        <tr key={exp.codigo} className="border-b border-border hover:bg-accent">
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-[#00bf63]">{exp.codigo}</span>
                          </td>
                          <td className="py-3 px-4 text-sm">{exp.nombre}</td>
                          <td className="py-3 px-4 text-sm">{exp.tipo}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                exp.riesgo === "Bajo"
                                  ? "bg-[#37ce48] text-white"
                                  : exp.riesgo === "Medio"
                                    ? "bg-[#fce809] text-[#7f8083]"
                                    : "bg-destructive text-white"
                              }
                            >
                              {exp.riesgo}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={
                                exp.estado === "Aprobado"
                                  ? "border-[#00bf63] text-[#00bf63]"
                                  : "border-[#fce809] text-[#7f8083]"
                              }
                            >
                              {exp.estado}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{exp.ultimaActualizacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="screening" className="space-y-6">
            <Card className="border-[#37ce48]/20">
              <CardHeader className="bg-[#37ce48]/5">
                <CardTitle>Historial de Screening</CardTitle>
                <CardDescription>Consultas realizadas contra listas nacionales e internacionales</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-[#a6a6a6] mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Filtros de búsqueda disponibles para consultar el historial de screenings
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pep" className="space-y-6">
            <Card className="border-[#fce809]/20">
              <CardHeader className="bg-[#fce809]/10">
                <CardTitle>Personas Expuestas Políticamente (PEP)</CardTitle>
                <CardDescription>Registro de PEP identificados con diligencia reforzada</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold">Expediente</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Nombre</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Condición PEP</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Cargo/Relación</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Fecha Identificación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pepActivos.map((pep, index) => (
                        <tr key={index} className="border-b border-border hover:bg-accent">
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-[#00bf63]">{pep.expediente}</span>
                          </td>
                          <td className="py-3 px-4 text-sm">{pep.nombre}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-[#fce809] text-[#7f8083]">{pep.condicion}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{pep.cargo}</td>
                          <td className="py-3 px-4 text-sm">{pep.fechaIdentificacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas" className="space-y-6">
            <Card className="border-destructive/20">
              <CardHeader className="bg-destructive/5">
                <CardTitle>Alertas del Sistema</CardTitle>
                <CardDescription>Alertas activas y cerradas del sistema de cumplimiento</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold">ID Alerta</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Tipo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Expediente</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Prioridad</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alertasActivas.map((alerta) => (
                        <tr key={alerta.id} className="border-b border-border hover:bg-accent">
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-[#00bf63]">{alerta.id}</span>
                          </td>
                          <td className="py-3 px-4 text-sm">{alerta.tipo}</td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-[#7f8083]">{alerta.expediente}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                alerta.prioridad === "Crítica" ? "bg-destructive text-white" : "bg-warning text-white"
                              }
                            >
                              {alerta.prioridad}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                alerta.estado === "Pendiente"
                                  ? "bg-[#fce809] text-[#7f8083]"
                                  : "bg-[#00bf63] text-white"
                              }
                            >
                              {alerta.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-6">
            <Card className="border-[#00bf63]/20">
              <CardHeader className="bg-[#00bf63]/5">
                <CardTitle>Bitácora de Auditoría</CardTitle>
                <CardDescription>Registro inmutable de todos los eventos del sistema</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-[#a6a6a6] mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Acceso a la bitácora completa de eventos del sistema</p>
                  <Button className="gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white">
                    <Eye className="h-4 w-4" />
                    Ver Bitácora Completa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6 border-[#fce809] border-2">
          <CardHeader className="bg-[#fce809]/10">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#7f8083]" />
              Características de la Vista Regulador
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#fce809] mt-1">•</span>
                <span>
                  <strong>Solo Lectura:</strong> Los inspectores de SUDEASEG no pueden modificar datos, solo consultar.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#fce809] mt-1">•</span>
                <span>
                  <strong>Acceso Registrado:</strong> Todos los accesos a esta vista quedan registrados en la bitácora
                  de auditoría.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#fce809] mt-1">•</span>
                <span>
                  <strong>Información Consolidada:</strong> Permite visualizar expedientes, screening, PEP, alertas y
                  auditoría desde una única interfaz.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#fce809] mt-1">•</span>
                <span>
                  <strong>Navegación Guiada:</strong> Interfaz diferenciada con pestañas para facilitar la inspección
                  regulatoria.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
