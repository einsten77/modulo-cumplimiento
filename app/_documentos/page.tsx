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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type DocumentStatus = "aprobado" | "pendiente" | "observado" | "vencido" | "proximo_vencer"

interface Document {
  id: string
  tipo: string
  estado: DocumentStatus
  fechaCarga: string
  fechaVencimiento: string
  usuarioCarga: string
  ultimaModificacion: string
  expediente: string
  entidad: string
}

const mockDocuments: Document[] = [
  {
    id: "DOC-001",
    tipo: "RIF",
    estado: "vencido",
    fechaCarga: "2024-01-15",
    fechaVencimiento: "2024-11-30",
    usuarioCarga: "Juan Pérez (Comercial)",
    ultimaModificacion: "2024-01-15",
    expediente: "CLI-2024-001",
    entidad: "Seguros Alfa, C.A.",
  },
  {
    id: "DOC-002",
    tipo: "Estados Financieros",
    estado: "proximo_vencer",
    fechaCarga: "2024-03-20",
    fechaVencimiento: "2025-01-10",
    usuarioCarga: "María González (Administración)",
    ultimaModificacion: "2024-03-20",
    expediente: "PROV-2024-015",
    entidad: "Proveedora Beta, S.A.",
  },
  {
    id: "DOC-003",
    tipo: "Acta Constitutiva",
    estado: "aprobado",
    fechaCarga: "2024-02-10",
    fechaVencimiento: "N/A",
    usuarioCarga: "Carlos Ruiz (Operaciones)",
    ultimaModificacion: "2024-02-12",
    expediente: "INT-2024-008",
    entidad: "Intermediario Gamma",
  },
  {
    id: "DOC-004",
    tipo: "Cédula de Identidad",
    estado: "pendiente",
    fechaCarga: "2024-12-10",
    fechaVencimiento: "2027-05-15",
    usuarioCarga: "Ana Torres (RRHH)",
    ultimaModificacion: "2024-12-10",
    expediente: "EMP-2024-042",
    entidad: "Pedro Martínez",
  },
  {
    id: "DOC-005",
    tipo: "Licencia SUDEASEG",
    estado: "observado",
    fechaCarga: "2024-11-05",
    fechaVencimiento: "2025-11-05",
    usuarioCarga: "Luis Fernández (Comercial)",
    ultimaModificacion: "2024-11-08",
    expediente: "INT-2024-023",
    entidad: "Corredor Delta",
  },
  {
    id: "DOC-006",
    tipo: "Contrato de Reaseguro",
    estado: "aprobado",
    fechaCarga: "2024-06-15",
    fechaVencimiento: "2025-06-15",
    usuarioCarga: "Ricardo López (Técnico)",
    ultimaModificacion: "2024-06-18",
    expediente: "REAS-2024-003",
    entidad: "Swiss Re Internacional",
  },
  {
    id: "DOC-007",
    tipo: "Comprobante Domicilio",
    estado: "vencido",
    fechaCarga: "2024-01-20",
    fechaVencimiento: "2024-04-20",
    usuarioCarga: "Ana Torres (RRHH)",
    ultimaModificacion: "2024-01-20",
    expediente: "EMP-2024-018",
    entidad: "Laura Sánchez",
  },
  {
    id: "DOC-008",
    tipo: "Certificado Bancario",
    estado: "pendiente",
    fechaCarga: "2024-12-12",
    fechaVencimiento: "2025-03-12",
    usuarioCarga: "María González (Administración)",
    ultimaModificacion: "2024-12-12",
    expediente: "PROV-2024-028",
    entidad: "Servicios Omega, C.A.",
  },
]

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  aprobado: { label: "Aprobado", variant: "default", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  pendiente: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3.5 w-3.5" /> },
  observado: { label: "Observado", variant: "outline", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  vencido: { label: "Vencido", variant: "destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
  proximo_vencer: { label: "Próximo a Vencer", variant: "outline", icon: <Clock className="h-3.5 w-3.5" /> },
}

export default function DocumentosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.entidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.expediente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "todos" || doc.estado === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Lista de Documentos por Expediente</h1>
              <p className="text-sm text-muted-foreground">Consulta y seguimiento documental</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
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
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="observado">Observado</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="proximo_vencer">Próximo a Vencer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>

        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo de Documento</TableHead>
                <TableHead>Entidad / Expediente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Carga</TableHead>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead>Usuario que Cargó</TableHead>
                <TableHead>Última Modificación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => {
                const status = statusConfig[doc.estado]
                const isExpiring = doc.estado === "proximo_vencer" || doc.estado === "vencido"

                return (
                  <TableRow key={doc.id} className={isExpiring ? "bg-destructive/5" : ""}>
                    <TableCell className="font-mono text-sm">{doc.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.tipo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{doc.entidad}</p>
                        <p className="text-xs text-muted-foreground">{doc.expediente}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(doc.fechaCarga).toLocaleDateString("es-VE")}</TableCell>
                    <TableCell className={`text-sm ${isExpiring ? "font-semibold text-destructive" : ""}`}>
                      {doc.fechaVencimiento !== "N/A"
                        ? new Date(doc.fechaVencimiento).toLocaleDateString("es-VE")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">{doc.usuarioCarga}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(doc.ultimaModificacion).toLocaleDateString("es-VE")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredDocuments.length} de {mockDocuments.length} documentos
        </div>
      </main>
    </div>
  )
}
