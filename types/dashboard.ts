export interface DashboardMetrics {
  totalDossiers: number
  incompleteDossiers: number
  expiredDocuments: number
  expiringDocuments: number
  activeAlerts: number
  mediumRiskCases: number
  highRiskCases: number
  pendingScreenings: number
  activePEP: number
  pendingApprovals: number
  recentRiskChanges: number
  complianceScore: number
  assignedDossiers: number
  documentsInReview: number
  openFollowups: number
  clientsCreated: number
  intermediariesCreated: number
  pendingDocumentation: number
  underSupervision: number
  pendingObservations: number
  documentsToUpload: number
}

export interface AlertItem {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  createdAt: string
  dossierNumber: string
  category: string
}

export interface RecentActivity {
  id: string
  type: string
  description: string
  user: string
  timestamp: string
  dossierNumber?: string
}

export interface DossierSummary {
  id: string
  dossierNumber: string
  entityName: string
  type: string
  status: string
  riskLevel: "BAJO" | "MEDIO" | "ALTO"
  assignedTo?: string
  lastUpdate: string
}
