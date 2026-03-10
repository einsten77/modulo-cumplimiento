export enum AlertLevel {
  CRÍTICA = "CRÍTICA",
  ALTA = "ALTA",
  MEDIA = "MEDIA",
  BAJA = "BAJA",
}

export enum AlertStatus {
  NUEVA = "NUEVA",
  EN_SEGUIMIENTO = "EN_SEGUIMIENTO",
  ATENDIDA = "ATENDIDA",
  CERRADA = "CERRADA",
}

export enum AlertOriginModule {
  DOSSIER = "DOSSIER",
  RISK = "RISK",
  DUE_DILIGENCE = "DUE_DILIGENCE",
  SCREENING = "SCREENING",
  PEP = "PEP",
  DOCUMENT = "DOCUMENT",
}

export interface Alert {
  alertId: string
  alertCode: string
  alertType: string
  alertLevel: AlertLevel
  originModule: AlertOriginModule
  dossierId: string
  entityType: string
  entityName: string
  entityIdentification: string
  status: AlertStatus
  description: string
  detectedAt: string
  detectedBy: string
  assignedTo?: string
  assignedAt?: string
  attendedBy?: string
  attendedAt?: string
  closedBy?: string
  closedAt?: string
  closureReason?: string
  requiresAction: boolean
  actionDeadline?: string
  priorityScore: number
  metadata?: Record<string, any>
  notificationSent: boolean
  escalated: boolean
  escalatedAt?: string
  escalatedTo?: string
  createdAt: string
}

export interface AlertTracking {
  trackingId: string
  alertId: string
  action: string
  performedBy: string
  performedAt: string
  comments?: string
  statusBefore?: AlertStatus
  statusAfter?: AlertStatus
  metadata?: Record<string, any>
}

export interface AlertSummaryDTO {
  total: number
  byStatus: Record<AlertStatus, number>
  byLevel: Record<AlertLevel, number>
  byModule: Record<AlertOriginModule, number>
  critical: number
  new: number
  overdue: number
  closedLast30Days: number
}

export interface ComplianceDashboardKPIs {
  highRiskDossiers: number
  mediumRiskDossiers: number
  expiredDocuments: number
  screeningMatches: number
  activePEPCases: number
  criticalAlerts: number
  pendingApprovals: number
  openCases: number
  overdueActions: number
}
