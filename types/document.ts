export type DocumentStatus = "aprobado" | "pendiente" | "observado" | "rechazado" | "vencido" | "proximo_vencer"

export type DocumentType =
  | "rif"
  | "cedula"
  | "acta_constitutiva"
  | "estados_financieros"
  | "licencia_sudeaseg"
  | "certificado_bancario"
  | "comprobante_domicilio"
  | "contrato_reaseguro"
  | "antecedentes_penales"
  | "referencias_bancarias"
  | "otro"

export type DossierType = "cliente" | "intermediario" | "proveedor" | "empleado" | "reasegurador"

export interface Document {
  id: string
  dossierId: string
  dossierType: DossierType
  tipo: DocumentType
  tipoDisplay: string
  estado: DocumentStatus
  fechaCarga: string
  fechaVencimiento: string | null
  usuarioCarga: string
  usuarioCargaId: string
  rolUsuario: string
  observaciones: string
  expediente: string
  entidad: string
  archivoUrl: string
  archivoNombre: string
  archivoTamano: number
  ultimaModificacion: string
  version: number
  // Approval workflow
  revisadoPor?: string
  aprobadoPor?: string
  fechaRevision?: string
  fechaAprobacion?: string
  observacionesRevision?: string
  motivoRechazo?: string
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  fechaCarga: string
  usuarioCarga: string
  archivoUrl: string
  archivoNombre: string
  observaciones: string
  estado: DocumentStatus
}

export interface DocumentAlert {
  id: string
  documentId: string
  tipo: "vencido" | "proximo_vencer" | "observado" | "rechazado"
  prioridad: "alta" | "media" | "baja"
  mensaje: string
  fechaGeneracion: string
  diasVencido?: number
  diasRestantes?: number
  diasSinCorregir?: number
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rif: "RIF",
  cedula: "Cédula de Identidad",
  acta_constitutiva: "Acta Constitutiva",
  estados_financieros: "Estados Financieros",
  licencia_sudeaseg: "Licencia SUDEASEG",
  certificado_bancario: "Certificado Bancario",
  comprobante_domicilio: "Comprobante de Domicilio",
  contrato_reaseguro: "Contrato de Reaseguro",
  antecedentes_penales: "Antecedentes Penales",
  referencias_bancarias: "Referencias Bancarias",
  otro: "Otro",
}

export const DOSSIER_TYPE_LABELS: Record<DossierType, string> = {
  cliente: "Cliente",
  intermediario: "Intermediario",
  proveedor: "Proveedor",
  empleado: "Empleado",
  reasegurador: "Reasegurador",
}

// Documents that require expiration date
export const DOCUMENTS_REQUIRING_EXPIRATION: DocumentType[] = [
  "rif",
  "cedula",
  "estados_financieros",
  "licencia_sudeaseg",
  "certificado_bancario",
  "comprobante_domicilio",
  "contrato_reaseguro",
  "antecedentes_penales",
  "referencias_bancarias",
]
