"use client"

import Link from "next/link"
import { ArrowLeft, Download, FileText, Calendar, AlertCircle, CheckCircle2, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ExportacionEvidenciaPage() {
  const exportacionesRecientes = [
    {
      id: "EXP-PDF-2024-012",
      fecha: "15/12/2024 10:30",
      usuario: "María González",
      modulo: "Screening",
      formato: "PDF",
      registros: 45,
      estado: "Completado",
    },
    {
      id: "EXP-CSV-2024-011",
      fecha: "14/12/2024 16:45",
      usuario: "Carlos Ramírez",
      modulo: "Documentos",
      formato: "CSV",
      registros: 156,
      estado: "Completado",
    },
    {
      id: "EXP-PDF-2024-010",
      fecha: "13/12/2024 09:15",
      usuario: "María González",
      modulo: "Bitácora Completa",
      formato: "PDF",
      registros: 523,
      estado: "Completado",
    },
  ]

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
                <h1 className="text-2xl font-semibold text-foreground">Exportación de Evidencia - SIAR</h1>
                <p className="text-sm text-muted-foreground">Generación de Reportes Regulatorios</p>
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
          <h2 className="text-3xl font-semibold text-foreground mb-2 flex items-center gap-3">
            <Download className="h-8 w-8 text-[#00bf63]" />
            Exportación de Evidencia
          </h2>
          <p className="text-muted-foreground">
            Genere reportes para inspección de SUDEASEG y auditorías con trazabilidad completa
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-[#00bf63]/20">
              <CardHeader className="bg-[#00bf63]/5">
                <CardTitle className="text-xl">Configurar Exportación</CardTitle>
                <CardDescription>Seleccione los módulos y parámetros para generar el reporte</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Seleccionar Módulos a Exportar</h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <Checkbox id="documentos" defaultChecked />
                      <label htmlFor="documentos" className="flex-1 text-sm font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#00bf63]" />
                          Módulo de Documentos
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Incluye documentos, estados, vencimientos y aprobaciones
                        </p>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <Checkbox id="screening" defaultChecked />
                      <label htmlFor="screening" className="flex-1 text-sm font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[#00bf63]" />
                          Módulo de Screening
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Incluye consultas, coincidencias y decisiones de cumplimiento
                        </p>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <Checkbox id="pep" />
                      <label htmlFor="pep" className="flex-1 text-sm font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#00bf63]" />
                          Módulo de PEP
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Incluye identificaciones PEP y diligencia reforzada
                        </p>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <Checkbox id="alertas" />
                      <label htmlFor="alertas" className="flex-1 text-sm font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-[#00bf63]" />
                          Módulo de Alertas y Casos
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Incluye alertas activas, seguimientos y cierres
                        </p>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
                      <Checkbox id="bitacora" defaultChecked />
                      <label htmlFor="bitacora" className="flex-1 text-sm font-medium cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[#00bf63]" />
                          Bitácora de Auditoría
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Incluye todos los eventos del sistema con trazabilidad completa
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Parámetros de Exportación</h3>

                  <div className="grid gap-4 md:grid-cols-2">
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Expedientes Específicos (opcional)</label>
                    <Input placeholder="EXP-2024-045, EXP-2024-044 (separar por comas)" />
                    <p className="text-xs text-muted-foreground">
                      Dejar vacío para exportar todos los expedientes del rango de fechas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Formato de Exportación</label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF - Documento para Inspección SUDEASEG</SelectItem>
                        <SelectItem value="csv">CSV - Datos Tabulares para Análisis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Opciones Adicionales</h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox id="incluir-justificaciones" defaultChecked />
                      <label htmlFor="incluir-justificaciones" className="text-sm font-medium cursor-pointer">
                        Incluir justificaciones completas
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox id="incluir-documentos-adjuntos" />
                      <label htmlFor="incluir-documentos-adjuntos" className="text-sm font-medium cursor-pointer">
                        Incluir documentos adjuntos (aumenta tamaño del archivo)
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox id="firma-digital" defaultChecked />
                      <label htmlFor="firma-digital" className="text-sm font-medium cursor-pointer">
                        Aplicar firma digital del Oficial de Cumplimiento
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full gap-2 bg-[#00bf63] hover:bg-[#37ce48] text-white text-base py-6">
                    <Download className="h-5 w-5" />
                    Generar Reporte de Evidencia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[#fce809]/20">
              <CardHeader className="bg-[#fce809]/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#7f8083]" />
                  Información Importante
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00bf63] mt-0.5 flex-shrink-0" />
                    <span>Toda exportación queda registrada en la bitácora de auditoría</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00bf63] mt-0.5 flex-shrink-0" />
                    <span>Los reportes incluyen metadatos de exportación y firma digital</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00bf63] mt-0.5 flex-shrink-0" />
                    <span>PDF genera documento listo para presentación oficial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00bf63] mt-0.5 flex-shrink-0" />
                    <span>CSV permite análisis avanzado en herramientas externas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-[#00bf63]/20">
              <CardHeader className="bg-[#00bf63]/5">
                <CardTitle className="text-lg">Acceso por Rol</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#00bf63] text-white">Permitido</Badge>
                    <span className="text-muted-foreground">Oficial de Cumplimiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#00bf63] text-white">Permitido</Badge>
                    <span className="text-muted-foreground">Auditoría Interna</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#00bf63] text-white">Permitido</Badge>
                    <span className="text-muted-foreground">Contraloría</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#a6a6a6] text-white">Denegado</Badge>
                    <span className="text-muted-foreground">Otros Roles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Exportaciones Recientes</CardTitle>
            <CardDescription>Historial de exportaciones realizadas con trazabilidad completa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">ID Exportación</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Fecha y Hora</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Módulo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Formato</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Registros</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Estado</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {exportacionesRecientes.map((exp) => (
                    <tr key={exp.id} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-[#00bf63]">{exp.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{exp.fecha}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-foreground">{exp.usuario}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">{exp.modulo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="border-[#00bf63] text-[#00bf63]">
                          {exp.formato}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{exp.registros} registros</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-[#00bf63] text-white">{exp.estado}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button size="sm" variant="ghost" className="gap-1 text-[#00bf63] hover:text-[#37ce48]">
                          <Download className="h-4 w-4" />
                          Descargar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
