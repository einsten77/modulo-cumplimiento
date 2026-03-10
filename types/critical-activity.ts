export type CriticalActivityType =
  | "RISK_CHANGE"
  | "PEP_DECISION"
  | "SCREENING_MATCH"
  | "DOCUMENT_APPROVAL"
  | "ALERT_CLOSURE"
  | "CASE_DECISION"

export type ActivitySeverity = "CRITICAL" | "HIGH" | "MEDIUM"

export interface CriticalActivity {
  id: string
  dossierId: string
  dossierCode: string
  activityType: CriticalActivityType
  severity: ActivitySeverity
  timestamp: string
  userId: string
  userName: string
  userRole: string
  module: string
  actionDescription: string
  previousState?: string
  newState: string
  justification: string
  evidenceFiles: string[]
  ipAddress: string
  metadata: Record<string, any>
}

export interface ActivityTimeline {
  dossierId: string
  dossierCode: string
  clientName: string
  activities: CriticalActivity[]
  totalActivities: number
}
