"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Calendar, User, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function DetalleEventoPage() {
  const evento = {
    id: "EVT-2024-001523",
    fecha: "15 de Diciembre de 2024, 14:32:15",
    usuario: {
      nombre: "María González",
      rol: "Oficial de Cumplimiento",
      email: "maria.gonzalez@laoccidental.com.ve",
      ip: "192.168.1.105",
    },
    modulo: "Screening - Decisión de Cumplimiento",
    accion: "Decisión de Cumplimiento - Descarte de Coincidencia",
    expediente: {
      codigo: "EXP-2024-045",
      tipo: "Persona Natural",
      nombre: "Juan Carlos Pérez Rodríguez",
      cedula: "V-18.456.789",
    },
    cambios: {
      estadoAnterior: "Pendiente Revisión",
      estadoNuevo: "Descartado - Falso Positivo",
      camposModificados: [
        {
          campo: "Estado de Screening",
          valorAnterior: "Pendiente Revisión",
          valorNuevo: "Descartado - Falso Positivo",
        },
        {
          campo: "Decisión del Oficial",
          valorAnterior: null,
          valorNuevo: "Descarte de Coincidencia",
        },
        {
          campo: "Nivel de Riesgo",
          valorAnterior: "Medio (65%)",
          valorNuevo: "Sin Riesgo",
        },
      ],
    },
    justificacion: {
      motivo: "Descarte de Coincidencia",
      detalles:
        "Después de análisis exhaustivo, se determina que la coincidencia del 65% con la lista OFAC corresponde a un falso positivo. El sujeto tiene nombre similar pero diferentes datos de identificación (fecha de nacimiento, nacionalidad y documentos no coinciden). Se adjunta documentación de respaldo que confirma la identidad del cliente.",
      documentosAdjuntos: ["Cédula de Identidad Ampliada", "RIF Actualizado", "Comprobante de Domicilio"],
      fechaDecision: "15 de Diciembre de 2024, 14:32:15",
    },
    alertasAsociadas: [
      {
        id: "ALT-2024-0234",
        tipo: "Coincidencia en Screening",
        estado: "Cerrada - Falso Positivo",
        fechaCierre: "15 de Diciembre de 2024, 14:32:15",
      },
    ],
    metadatos: {
      navegador: "Chrome 120.0.0",
      sistemaOperativo: "Windows 10",
      duracionSesion: "1 hora 45 minutos",
      accionesEnSesion: 12,
    },
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
                <h1 className="text-2xl font-semibold text-foreground">Detalle del Evento - SIAR</h1>
                <p className="text-sm text-muted-foreground">Información Completa del Evento Registrado</p>
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
          <Link href="/auditoria/bitacora">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a la Bitácora
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-[#00bf63]" />
                {evento.id}
              </h2>
              <p className="text-muted-foreground">{evento.fecha}</p>
            </div>
            <Badge className="bg-[#00bf63] text-white text-base px-4 py-2">Evento Inmutable</Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[#00bf63]/20">
            <CardHeader className="bg-[#00bf63]/5">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#00bf63]" />
                Información del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Usuario</label>
                <p className="text-base font-semibold text-foreground">{evento.usuario.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rol</label>
                <p className="text-base text-foreground">{evento.usuario.rol}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base text-foreground">{evento.usuario.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dirección IP</label>
                <p className="text-base font-mono text-[#7f8083]">{evento.usuario.ip}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#00bf63]/20">
            <CardHeader className="bg-[#00bf63]/5">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00bf63]" />
                Información del Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Módulo</label>
                <p className="text-base font-semibold text-foreground">{evento.modulo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Acción Realizada</label>
                <p className="text-base text-foreground">{evento.accion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha y Hora</label>
                <p className="text-base text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#00bf63]" />
                  {evento.fecha}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-[#00bf63]/20">
          <CardHeader className="bg-[#00bf63]/5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00bf63]" />
              Expediente Asociado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Código</label>
                <p className="text-base font-mono font-semibold text-[#00bf63]">{evento.expediente.codigo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <p className="text-base text-foreground">{evento.expediente.tipo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                <p className="text-base text-foreground">{evento.expediente.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cédula</label>
                <p className="text-base font-mono text-[#7f8083]">{evento.expediente.cedula}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-[#fce809]">
          <CardHeader className="bg-[#fce809]/10">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#7f8083]" />
              Cambios Realizados
            </CardTitle>
            <CardDescription>Comparación entre el estado anterior y nuevo</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Estado Anterior
                </h4>
                <p className="text-base text-foreground">{evento.cambios.estadoAnterior}</p>
              </div>
              <div className="p-4 bg-[#00bf63]/5 border border-[#00bf63]/20 rounded-lg">
                <h4 className="text-sm font-semibold text-[#00bf63] mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Estado Nuevo
                </h4>
                <p className="text-base text-foreground">{evento.cambios.estadoNuevo}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <h4 className="text-sm font-semibold text-foreground mb-4">Campos Modificados</h4>
            <div className="space-y-4">
              {evento.cambios.camposModificados.map((cambio, index) => (
                <div key={index} className="p-4 bg-accent rounded-lg">
                  <div className="font-medium text-foreground mb-3">{cambio.campo}</div>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Antes:</span>{" "}
                      <span className="text-foreground">
                        {cambio.valorAnterior || <em className="text-muted-foreground">Sin valor</em>}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Después:</span>{" "}
                      <span className="font-medium text-[#00bf63]">{cambio.valorNuevo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-[#00bf63]/20">
          <CardHeader className="bg-[#00bf63]/5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00bf63]" />
              Justificación Registrada
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Motivo de la Decisión</label>
              <p className="text-base font-semibold text-foreground mt-1">{evento.justificacion.motivo}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Detalles</label>
              <p className="text-base text-foreground mt-1 leading-relaxed">{evento.justificacion.detalles}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Documentos Adjuntos</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {evento.justificacion.documentosAdjuntos.map((doc, index) => (
                  <Badge key={index} variant="outline" className="border-[#00bf63] text-[#00bf63]">
                    {doc}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Decisión</label>
              <p className="text-base text-foreground mt-1">{evento.justificacion.fechaDecision}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-[#37ce48]/20">
          <CardHeader className="bg-[#37ce48]/5">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#37ce48]" />
              Alertas Asociadas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {evento.alertasAsociadas.map((alerta, index) => (
              <div key={index} className="p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-semibold text-[#00bf63]">{alerta.id}</span>
                  <Badge className="bg-[#00bf63] text-white">{alerta.estado}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Tipo:</strong> {alerta.tipo}
                  </p>
                  <p>
                    <strong>Fecha de Cierre:</strong> {alerta.fechaCierre}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-6 border-[#a6a6a6]/20">
          <CardHeader className="bg-[#a6a6a6]/5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-[#7f8083]" />
              Metadatos Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Navegador</label>
                <p className="text-foreground">{evento.metadatos.navegador}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sistema Operativo</label>
                <p className="text-foreground">{evento.metadatos.sistemaOperativo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Duración de Sesión</label>
                <p className="text-foreground">{evento.metadatos.duracionSesion}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Acciones en Sesión</label>
                <p className="text-foreground">{evento.metadatos.accionesEnSesion}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
