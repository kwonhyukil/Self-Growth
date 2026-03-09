export interface VerbalizationSession {
  id: number
  logId: number
  rawThoughts: string
  thinkingDurationMs: number | null
  probingQuestion: string | null
  probingAnswer: string | null
  aiInsightJa: string | null
  aiInsightKo: string | null
  verbalizationScore: number | null
  completedSteps: number
  createdAt: string
  updatedAt: string
}

export interface BrainstormResult {
  sessionId: number
  probingQuestion: string
}

export interface InsightResult {
  sessionId: number
  aiInsightJa: string
  aiInsightKo: string
  verbalizationScore: number
}
