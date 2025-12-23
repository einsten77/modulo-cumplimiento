"use client"

import Link from "next/link"
import { ArrowLeft, Download, Search, Filter, Shield, Calendar, User, FileText, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function BitacoraAuditoriaPage() {
  const eventos = [
    {
      id: "EVT-2024-001523",
      fecha: "2024-12-15 14:32:15",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
      modulo: "Screening",
      accion: "Decisión de Cumplimiento - Descarte de Coincidencia",
      expediente: "EXP-2024-045",
      estadoAnterior: "Pendiente Revisión",
      estadoNuevo: "Descartado - Falso Positivo",
      tipo: "decision",
    },
    {
      id: "EVT-2024-001522",
      fecha: "2024-12-15 14:28:43",
      usuario: "Carlos Ramírez",
      rol: "Analista de Riesgos",
      modulo: "Screening",
      accion: "Ejecución de Screening - Listas Internacionales",
      expediente: "EXP-2024-045",
      estadoAnterior: null,
      estadoNuevo: "Screening Ejecutado",
      tipo: "screening",
    },
    {
      id: "EVT-2024-001521",
      fecha: "2024-12-15 13:45:22",
      usuario: "Ana Martínez",
      rol: "Personal Comercial",
      modulo: "Documentos",
      accion: "Carga de Documento - RIF Actualizado",
      expediente: "EXP-2024-044",
      estadoAnterior: null,
      estadoNuevo: "Pendiente Aprobación",
      tipo: "documento",
    },
    {
      id: "EVT-2024-001520",
      fecha: "2024-12-15 12:18:05",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
      modulo: "PEP",
      accion: "Identificación PEP - Declaración de PEP Vinculado",
      expediente: "EXP-2024-043",
      estadoAnterior: "No PEP",
      estadoNuevo: "PEP Vinculado",
      tipo: "pep",
    },
    {
      id: "EVT-2024-001519",
      fecha: "2024-12-15 11:55:30",
      usuario: "Luis Fernández",
      rol: "Personal RR.HH.",
      modulo: "Documentos",
      accion: "Carga de Documento - Antecedentes Penales",
      expediente: "EXP-2024-042",
      estadoAnterior: null,
      estadoNuevo: "Pendiente Aprobación",
      tipo: "documento",
    },
    {
      id: "EVT-2024-001518",
      fecha: "2024-12-15 10:22:18",
      usuario: "María González",
      rol: "Oficial de Cumplimiento",
      modulo: "Alertas",
      accion: "Cierre de Alerta - Riesgo Mitigado",
      expediente: "EXP-2024-041",
      estadoAnterior: "En Seguimiento",
      estadoNuevo: "Cerrado - Riesgo Mitigado",
      tipo: "alerta",
    },
    {
      id: "EVT-2024-001517",
      fecha: "2024-12-15 09:40:55",
      usuario: "Carlos Ramírez",
      rol: "Analista de Riesgos",
      modulo: "Alertas",
      accion: "Seguimiento de Caso - Documentación Complementaria Recibida",
      expediente: "EXP-2024-041",
      estadoAnterior: "Pendiente Documentación",
      estadoNuevo: "En Seguimiento",
      tipo: "seguimiento",
    },
    {
      id: "EVT-2024-001516",
      fecha: "2024-12-15 08:15:33",
      usuario: "Inspector SUDEASEG",
      rol: "Inspector Regulador",
      modulo: "Vista Regulador",
      accion: "Acceso a Vista Regulador - Consulta de Expedientes",
      expediente: null,
      estadoAnterior: null,
      estadoNuevo: null,
      tipo: "acceso",
    },
  ]

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { color: string; label: string }> = {
      decision: { color: "bg-[#00bf63] text-white", label: "Decisión" },
      screening: { color: "bg-[#37ce48] text-white", label: "Screening" },
      documento: { color: "bg-[#7f8083] text-white", label: "Documento" },
      pep: { color: "bg-[#fce809] text-[#7f8083]", label: "PEP" },
      alerta: { color: "bg-destructive text-white", label: "Alerta" },
      seguimiento: { color: "bg-info text-white", label: "Seguimiento" },
      acceso: { color: "bg-[#a6a6a6] text-white", label: "Acceso" },
    }
    const config = tipos[tipo] || tipos.acceso
    return <Badge className={config.color}>{config.label}</Badge>
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
                <h1 className="text-2xl font-semibold text-foreground">Bitácora de Auditoría - SIAR</h1>
                <p className="text-sm text-muted-foreground">Registro Inmutable de Eventos del Sistema</p>
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
              Volver al Panel Principal
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-[#00bf63]" />
                Bitácora de Auditoría
              </h2>
              <p className="text-muted-foreground">
                Registro cronológico inmutable de todos los eventos del sistema SIAR
              </p>
            </div>
            <Button className="gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white">
              <Download className="h-4 w-4" />
              Exportar Evidencia
            </Button>
          </div>

          <Card className="border-[#00bf63]/20">
            <CardHeader className="bg-[#00bf63]/5">
              <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
              <CardDescription>Refine la búsqueda de eventos en la bitácora</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#00bf63]" />
                    Fecha Desde
                  </label>
                  <Input type="date" defaultValue="2024-12-01" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#00bf63]" />
                    Fecha Hasta
                  </label>
                  <Input type="date" defaultValue="2024-12-15" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-[#00bf63]" />
                    Usuario
                  </label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los Usuarios</SelectItem>
                      <SelectItem value="maria">María González</SelectItem>
                      <SelectItem value="carlos">Carlos Ramírez</SelectItem>
                      <SelectItem value="ana">Ana Martínez</SelectItem>
                      <SelectItem value="luis">Luis Fernández</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#00bf63]" />
                    Rol
                  </label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los Roles</SelectItem>
                      <SelectItem value="oficial">Oficial de Cumplimiento</SelectItem>
                      <SelectItem value="analista">Analista de Riesgos</SelectItem>
                      <SelectItem value="comercial">Personal Comercial</SelectItem>
                      <SelectItem value="rrhh">Personal RR.HH.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#00bf63]" />
                    Módulo
                  </label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los Módulos</SelectItem>
                      <SelectItem value="documentos">Documentos</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="pep">PEP</SelectItem>
                      <SelectItem value="alertas">Alertas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#00bf63]" />
                    Tipo de Acción
                  </label>
                  <Select defaultValue="todos">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las Acciones</SelectItem>
                      <SelectItem value="decision">Decisión</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="documento">Documento</SelectItem>
                      <SelectItem value="pep">PEP</SelectItem>
                      <SelectItem value="alerta">Alerta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#00bf63]" />
                    Expediente
                  </label>
                  <Input placeholder="EXP-2024-XXX" />
                </div>

                <div className="flex items-end">
                  <Button className="w-full gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white">
                    <Search className="h-4 w-4" />
                    Buscar Eventos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Eventos Registrados</CardTitle>
                <CardDescription className="mt-1">
                  {eventos.length} eventos encontrados - La bitácora es inmutable y no permite eliminación
                </CardDescription>
              </div>
              <Badge className="bg-[#00bf63] text-white text-base px-4 py-2">Registro Inmutable</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ID Evento</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Fecha y Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Rol</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Módulo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Acción</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Expediente</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Tipo</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((evento) => (
                    <tr key={evento.id} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-[#00bf63]">{evento.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{evento.fecha}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{evento.usuario}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{evento.rol}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="border-[#00bf63] text-[#00bf63]">
                          {evento.modulo}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{evento.accion}</span>
                      </td>
                      <td className="py-3 px-4">
                        {evento.expediente ? (
                          <span className="text-sm font-mono text-[#7f8083]">{evento.expediente}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getTipoBadge(evento.tipo)}</td>
                      <td className="py-3 px-4 text-center">
                        <Link href="/auditoria/detalle">
                          <Button size="sm" variant="ghost" className="gap-1 text-[#00bf63] hover:text-[#37ce48]">
                            <Eye className="h-4 w-4" />
                            Ver Detalle
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-[#fce809]">
          <CardHeader className="bg-[#fce809]/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#7f8083]" />
              Características de la Bitácora Inmutable
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#00bf63] mt-1">•</span>
                <span>
                  <strong>Inmutabilidad:</strong> Los eventos registrados no pueden ser editados ni eliminados por
                  ningún usuario del sistema.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00bf63] mt-1">•</span>
                <span>
                  <strong>Trazabilidad Completa:</strong> Todos los accesos a la bitácora quedan registrados
                  automáticamente.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00bf63] mt-1">•</span>
                <span>
                  <strong>Evidencia Regulatoria:</strong> La bitácora sirve como evidencia oficial para inspecciones de
                  SUDEASEG.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00bf63] mt-1">•</span>
                <span>
                  <strong>Reconstrucción de Hechos:</strong> Permite reconstruir la secuencia completa de eventos para
                  cualquier expediente.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
