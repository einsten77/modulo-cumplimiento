export type ScreeningList = "ONU" | "OFAC" | "UE" | "UNIF" | "GAFI"

export type EntityType = "NATURAL" | "JURIDICA"

export type MatchLevel = "BAJO" | "MEDIO" | "ALTO"

export type DecisionType = "DESCARTADA" | "RELEVANTE" | "SEGUIMIENTO"

export type ScreeningStatus = "IN_PROGRESS" | "COMPLETED" | "PENDING_DECISION" | "DECIDED"

export interface ScreeningSubject {
  fullName: string
  documentType: string
  documentNumber: string
  entityType: EntityType
}

export interface ScreeningMatch {
  matchId: string
  listName: ScreeningList
  nameFound: string
  similarityPercentage: number
  matchLevel: MatchLevel
  matchDetails: string
  associatedDocuments: string
  listIncorporationDate: string
  additionalInfo?: string
}

export interface ScreeningExecutionRequest {
  dossierId: string
  subject: ScreeningSubject
  selectedLists: ScreeningList[]
  executedByUserId: string
}

export interface ScreeningResult {
  screeningId: string
  dossierId: string
  subject: ScreeningSubject
  executionDate: string
  executedBy: string
  executedByUserId: string
  selectedLists: ScreeningList[]
  matches: ScreeningMatch[]
  highestMatchLevel: MatchLevel | null
  status: ScreeningStatus
  decision?: ScreeningDecision
}

export interface ScreeningDecision {
  decisionType: DecisionType
  justification: string
  decidedBy: string
  decidedByUserId: string
  decisionDate: string
  observaciones?: string
}

export interface ScreeningHistoryItem {
  screeningId: string
  executionDate: string
  dossierId: string
  subject: ScreeningSubject
  matchCount: number
  highestMatchLevel: MatchLevel | null
  decision: DecisionType | "SIN_COINCIDENCIAS" | "PENDIENTE"
  executedBy: string
  executedByRole: string
}
