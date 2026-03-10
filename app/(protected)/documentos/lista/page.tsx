"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Document, DocumentStatus } from "@/types/document"
import { DOSSIER_TYPE_LABELS } from "@/types/document"
import { useAuth } from "@/lib/auth/auth-context"

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  aprobado: { label: "Aprobado", variant: "default", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  pendiente: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3.5 w-3.5" /> },
  observado: { label: "Observado", variant: "outline", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  rechazado: { label: "Rechazado", variant: "destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
  vencido: { label: "Vencido", variant: "destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
  proximo_vencer: {
    label: "Próximo a Vencer",
    variant: "outline",
    icon: <Clock className="h-3.5 w-3.5 text-warning" />,
  },
}

// Mock data - will be replaced by API calls
const mockDocuments: Document[] = [
  {
    id: "DOC-001",
    dossierId: "CLI-2024-001",
    dossierType: "cliente",
    tipo: "rif",
    tipoDisplay: "RIF",
    estado: "vencido",
    fechaCarga: "2024-01-15",
    fechaVencimiento: "2024-11-30",
    usuarioCarga: "Juan Pérez",
    usuarioCargaId: "USR-001",
    rolUsuario: "Comercial",
    observaciones: "",
    expediente: "CLI-2024-001",
    entidad: "Seguros Alfa, C.A.",
    archivoUrl: "/documents/doc-001.pdf",
    archivoNombre: "rif-seguros-alfa.pdf",
    archivoTamano: 2048000,
    ultimaModificacion: "2024-01-15",
    version: 1,
  },
  {
    id: "DOC-002",
    dossierId: "PROV-2024-015",
    dossierType: "proveedor",
    tipo: "estados_financieros",
    tipoDisplay: "Estados Financieros",
    estado: "proximo_vencer",
    fechaCarga: "2024-03-20",
    fechaVencimiento: "2025-01-10",
    usuarioCarga: "María González",
    usuarioCargaId: "USR-002",
    rolUsuario: "Administración",
    observaciones: "",
    expediente: "PROV-2024-015",
    entidad: "Proveedora Beta, S.A.",
    archivoUrl: "/documents/doc-002.pdf",
    archivoNombre: "estados-financieros-2024.pdf",
    archivoTamano: 5120000,
    ultimaModificacion: "2024-03-20",
    version: 1,
  },
  {
    id: "DOC-003",
    dossierId: "INT-2024-008",
    dossierType: "intermediario",
    tipo: "acta_constitutiva",
    tipoDisplay: "Acta Constitutiva",
    estado: "aprobado",
    fechaCarga: "2024-02-10",
    fechaVencimiento: null,
    usuarioCarga: "Carlos Ruiz",
    usuarioCargaId: "USR-003",
    rolUsuario: "Operaciones",
    observaciones: "",
    expediente: "INT-2024-008",
    entidad: "Intermediario Gamma",
    archivoUrl: "/documents/doc-003.pdf",
    archivoNombre: "acta-constitutiva.pdf",
    archivoTamano: 1536000,
    ultimaModificacion: "2024-02-12",
    version: 1,
    aprobadoPor: "Oficial de Cumplimiento",
    fechaAprobacion: "2024-02-12",
  },
  {
    id: "DOC-004",
    dossierId: "EMP-2024-042",
    dossierType: "empleado",
    tipo: "cedula",
    tipoDisplay: "Cédula de Identidad",
    estado: "pendiente",
    fechaCarga: "2024-12-10",
    fechaVencimiento: "2027-05-15",
    usuarioCarga: "Ana Torres",
    usuarioCargaId: "USR-004",
    rolUsuario: "RRHH",
    observaciones: "Documento recién cargado",
    expediente: "EMP-2024-042",
    entidad: "Pedro Martínez",
    archivoUrl: "/documents/doc-004.pdf",
    archivoNombre: "cedula-pedro-martinez.pdf",
    archivoTamano: 1024000,
    ultimaModificacion: "2024-12-10",
    version: 1,
  },
  {
    id: "DOC-005",
    dossierId: "INT-2024-023",
    dossierType: "intermediario",
    tipo: "licencia_sudeaseg",
    tipoDisplay: "Licencia SUDEASEG",
    estado: "observado",
    fechaCarga: "2024-11-05",
    fechaVencimiento: "2025-11-05",
    usuarioCarga: "Luis Fernández",
    usuarioCargaId: "USR-005",
    rolUsuario: "Comercial",
    observaciones: "",
    expediente: "INT-2024-023",
    entidad: "Corredor Delta",
    archivoUrl: "/documents/doc-005.pdf",
    archivoNombre: "licencia-corredor-delta.pdf",
    archivoTamano: 2560000,
    ultimaModificacion: "2024-11-08",
    version: 1,
    revisadoPor: "Unidad de Cumplimiento",
    fechaRevision: "2024-11-08",
    observacionesRevision: "Documento presenta fecha ilegible. Se requiere copia más clara.",
  },
]

export default function DocumentosListaPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("todos")
  const [filterType, setFilterType] = useState<string>("todos")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.tipoDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.expediente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "todos" || doc.estado === filterStatus
    const matchesType = filterType === "todos" || doc.dossierType === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const canUploadDocuments =
    user?.role === "USUARIO_COMERCIAL" || user?.role === "USUARIO_RRHH" || user?.role === "OFICIAL_CUMPLIMIENTO"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Lista de Documentos</h1>
                <p className="text-sm text-muted-foreground">Consulta y seguimiento documental por expediente</p>
              </div>
            </div>
            {canUploadDocuments && (
              <Button asChild>
                <Link href="/documentos/carga">
                  <Upload className="mr-2 h-4 w-4" />
                  Cargar Documento
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por tipo, entidad o expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="observado">Observado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="proximo_vencer">Próximo a Vencer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo de Expediente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="intermediario">Intermediario</SelectItem>
                <SelectItem value="proveedor">Proveedor</SelectItem>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="reasegurador">Reasegurador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>

        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo de Documento</TableHead>
                  <TableHead>Entidad / Expediente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Carga</TableHead>
                  <TableHead>Fecha de Vencimiento</TableHead>
                  <TableHead>Usuario que Cargó</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron documentos con los filtros seleccionados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((doc) => {
                    const status = statusConfig[doc.estado]
                    const isExpiring = doc.estado === "proximo_vencer" || doc.estado === "vencido"

                    return (
                      <TableRow key={doc.id} className={isExpiring ? "bg-destructive/5" : ""}>
                        <TableCell className="font-mono text-sm">{doc.id}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.tipoDisplay}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{doc.entidad}</p>
                            <p className="text-xs text-muted-foreground">{doc.expediente}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {DOSSIER_TYPE_LABELS[doc.dossierType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            {status.icon}
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(doc.fechaCarga).toLocaleDateString("es-VE")}
                        </TableCell>
                        <TableCell className={`text-sm ${isExpiring ? "font-semibold text-destructive" : ""}`}>
                          {doc.fechaVencimiento ? new Date(doc.fechaVencimiento).toLocaleDateString("es-VE") : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <p>{doc.usuarioCarga}</p>
                            <p className="text-xs text-muted-foreground">{doc.rolUsuario}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/documentos/revision/${doc.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {filteredDocuments.length} de {documents.length} documentos
          </p>
        </div>

        <div className="mt-8 p-6 rounded-lg bg-muted">
          <h3 className="font-semibold mb-3">Información de Control Documental</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Los documentos vencidos se marcan automáticamente como críticos</li>
            <li>• Las alertas de vencimiento se generan 30 días antes de la fecha de vencimiento</li>
            <li>• Los documentos observados requieren corrección por parte del usuario responsable</li>
            <li>• Todos los documentos pasan por el flujo de aprobación de Cumplimiento</li>
            <li>• El historial completo de versiones se mantiene para auditoría</li>
            <li>• No se permite la eliminación de documentos, solo carga de nuevas versiones</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
