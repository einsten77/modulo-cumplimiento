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
  // ... deja el resto igual que ya lo tienes
]

export default function DocumentosListaClient() {
  const { user } = useAuth()
  const [documents] = useState<Document[]>(mockDocuments)
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
      {/* … pega aquí el resto EXACTO de tu componente como lo enviaste */}
    </div>
  )
}
