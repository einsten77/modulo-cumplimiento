export interface PepDeclaration {
  id: number
  dossierId: number
  dossierNumber: string
  clientName: string
  documentId: string
  nationality: string
  isPep: boolean
  pepCondition: "NO_PEP" | "CURRENT_PEP" | "FORMER_PEP" | "RELATED_PEP"
  pepType?: "NATIONAL" | "FOREIGN" | "INTERNATIONAL"
  relationshipType?: "SPOUSE" | "FIRST_DEGREE" | "SECOND_DEGREE" | "BUSINESS_PARTNER" | "CLOSE_ASSOCIATE"
  position?: string
  institution?: string
  country?: string
  startDate?: string
  endDate?: string
  hierarchyLevel?: "HIGH" | "MEDIUM" | "OTHER"
  informationSource: string
  sourceUrl?: string
  additionalSources?: string
  justification: string
  enhancedMeasures?: string
  observations?: string
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  riskImpact: number
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  updatedAt: string
}

export interface PepRelative {
  id: number
  pepDeclarationId: number
  fullName: string
  documentId: string
  nationality: string
  relationshipType: "SPOUSE" | "FIRST_DEGREE" | "SECOND_DEGREE" | "BUSINESS_PARTNER" | "CLOSE_ASSOCIATE"
  pepPosition?: string
  pepInstitution?: string
  evaluationStatus: "PENDING" | "IN_REVIEW" | "EVALUATED"
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"
  observations?: string
  createdAt: string
  updatedAt: string
}

export interface PepEnhancedMeasures {
  id: number
  pepDeclarationId: number
  complianceOfficerApproval: boolean
  complianceOfficerApprovalDate?: string
  complianceOfficerName?: string
  enhancedFundsOrigin: boolean
  fundsOriginDetails?: string
  expandedScreening: boolean
  screeningFrequency?: "MONTHLY" | "QUARTERLY" | "BIANNUAL"
  intensifiedMonitoring: boolean
  monitoringDetails?: string
  additionalDocumentation: boolean
  documentationList?: string[]
  periodicUpdate: boolean
  updateFrequency?: "QUARTERLY" | "BIANNUAL" | "ANNUAL"
  justification: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PepHistory {
  id: number
  pepDeclarationId: number
  dossierId: number
  action: string
  previousCondition?: string
  newCondition: string
  previousPosition?: string
  newPosition?: string
  justification: string
  performedBy: string
  performedByRole: string
  performedAt: string
  status: "APPROVED" | "REJECTED" | "COMPLETED"
}

export interface PepAlert {
  id: number
  pepDeclarationId: number
  alertType: "PEP_DETECTED" | "DOCUMENTATION_PENDING" | "MONITORING_DUE" | "APPROVAL_REQUIRED" | "UPDATE_REQUIRED"
  severity: "LOW" | "MEDIUM" | "HIGH"
  title: string
  description: string
  status: "ACTIVE" | "RESOLVED" | "DISMISSED"
  dueDate?: string
  createdAt: string
  resolvedAt?: string
}
