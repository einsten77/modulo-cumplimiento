export type RiskLevel = "BAJO" | "MEDIO" | "ALTO"

export type EvaluationType = "INICIAL" | "PERIODICA" | "RE_EVALUACION"

export type EvaluationStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED"

export interface RiskFactor {
  factorId: string
  factorName: string
  description: string
  weight: number // 0-5
  observation: string
  requiresObservation?: boolean
}

export interface RiskEvaluation {
  evaluationId: string
  dossierId: string
  dossierName?: string
  evaluationType: EvaluationType
  evaluationDate: string
  evaluatorUserId: string
  evaluatorName?: string
  version: number
  status: EvaluationStatus
  riskFactors: RiskFactor[]
  preliminaryRiskLevel: RiskLevel
  finalRiskLevel: RiskLevel
  totalScore: number
  hasManualOverride: boolean
  manualOverrideJustification?: string
  overrideAppliedBy?: string
  requiresApproval: boolean
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  nextReviewDate?: string
  comments?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateEvaluationRequest {
  dossierId: string
  evaluationType: EvaluationType
  riskFactors: RiskFactor[]
  userId: string
  comments?: string
}

export interface UpdateEvaluationRequest {
  evaluationId: string
  riskFactors: RiskFactor[]
  userId: string
}

export interface ApproveEvaluationRequest {
  evaluationId: string
  approvalComments?: string
  userId: string
}

export interface RejectEvaluationRequest {
  evaluationId: string
  rejectionReason: string
  userId: string
}
