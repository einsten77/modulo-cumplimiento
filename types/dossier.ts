export type DossierType = "CLIENT" | "INTERMEDIARY" | "EMPLOYEE" | "PROVIDER" | "REINSURER" | "RETROCESSIONAIRE"

export type DossierStatus = "INCOMPLETE" | "UNDER_REVIEW" | "REQUIRES_INFO" | "OBSERVED" | "APPROVED"

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export interface Dossier {
  id: string
  dossierId: string
  subjectType: DossierType
  name: string
  documentType?: string
  documentNumber: string
  riskLevel: RiskLevel
  status: DossierStatus
  isPep: boolean
  completenessPercentage: number
  alertCount: number
  createdAt: string
  createdBy: string
  createdByRole: string
  lastModifiedAt: string
  lastModifiedBy: string
  lastModifiedByRole: string
  approvedAt?: string
  approvedBy?: string
}

export interface DossierDetail extends Dossier {
  // Datos generales
  address?: string
  economicActivity?: string
  originOfFunds?: string
  beneficialOwner?: string
  country?: string
  state?: string
  city?: string
  highRiskZone: boolean
  latitude?: string
  longitude?: string
  email?: string
  phone?: string

  // Productos y canales
  products?: string[]
  distributionChannel?: string

  // Evaluación de riesgo
  currentRiskScore?: number
  riskFactors?: RiskFactor[]
  lastRiskEvaluation?: string
  riskEvaluationBy?: string

  // Documentos
  documents?: DossierDocument[]

  // Screening
  screenings?: ScreeningResult[]

  // Alertas
  alerts?: Alert[]

  // Historial
  history?: HistoryEntry[]

  // PEP information
  pepInfo?: PEPInformation
  pepHistory?: PEPHistory[]
}

export interface RiskFactor {
  factor: string
  score: number
  observation: string
}

export interface DossierDocument {
  id: string
  name: string
  status: "APPROVED" | "PENDING" | "REJECTED"
  uploadDate: string
  expiryDate?: string
  uploadedBy: string
  fileUrl?: string
}

export interface ScreeningResult {
  id: string
  date: string
  lists: string[]
  matches: number
  status: "NO_MATCH" | "POTENTIAL_MATCH" | "CONFIRMED_MATCH"
  decision?: string
  decidedBy?: string
  decidedAt?: string
}

export interface Alert {
  id: string
  type: string
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  description: string
  status: "ACTIVE" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  createdAt: string
  resolvedAt?: string
}

export interface HistoryEntry {
  id: string
  date: string
  user: string
  role: string
  action: string
  details?: string
}

export interface CreateDossierRequest {
  subjectType: DossierType
  name: string
  documentType?: string
  documentNumber: string
  email?: string
  phone?: string
  address?: string
  economicActivity?: string
  originOfFunds?: string
  country?: string
  state?: string
  city?: string
  status?: DossierStatus
  [key: string]: unknown
}

export interface UpdateDossierRequest extends Partial<CreateDossierRequest> {
  id: string
}

export interface ApproveDossierRequest {
  dossierId: string
  observation?: string
}

export interface RejectDossierRequest {
  dossierId: string
  reason: string
  details?: string
}

export interface DossierFilters {
  search?: string
  subjectType?: DossierType | "ALL"
  riskLevel?: RiskLevel | "ALL"
  status?: DossierStatus | "ALL"
  dateFrom?: string
  dateTo?: string
  isPep?: boolean
  hasAlerts?: boolean
  page?: number
  pageSize?: number
}

export interface DossierListResponse {
  data: Dossier[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// PEP-related types
export interface PEPInformation {
  id: string
  isPep: boolean
  pepType?: "DIRECT" | "RELATED" | "CLOSE_ASSOCIATE" | "FORMER"
  position?: string
  entity?: string
  country?: string
  startDate?: string
  endDate?: string
  source: string
  verifiedBy?: string
  verifiedAt?: string
  observations?: string
  riskLevel?: RiskLevel
}

export interface PEPHistory {
  id: string
  date: string
  action: string
  previousStatus: boolean
  newStatus: boolean
  user: string
  details?: string
}
