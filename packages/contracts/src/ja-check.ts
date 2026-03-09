import type {
  DetectedStyle,
  RecommendedStyle,
  RuleTag,
  Severity,
} from './common'

export interface JaIssue {
  issueId: string
  ruleTag: RuleTag
  severity: Severity
  problem: string
  why: string
  selfCheckQuestion: string
  rewriteTask: string
  exampleFixes?: string[]
  span?: { start: number; end: number }
}

export interface JaOverall {
  score: number
  comment: string
  nextStepQuestion: string
  detectedStyle: DetectedStyle
  recommendedStyle: RecommendedStyle
}

export interface JaCheckPayload {
  overall: JaOverall
  issues: JaIssue[]
}

export interface JaCheckResponse {
  mode: 'expand' | 'cached' | 'fresh'
  resultId: number
  overall: JaOverall
  issues: JaIssue[]
}

export interface JaCheckResult {
  id: number
  logId: number
  toolName: string
  originalText: string
  issuesJson: JaCheckPayload
  issueCount: number
  createdAt: string
}

export interface JaCheckResultSummary {
  id: number
  toolName: string
  issueCount: number
  createdAt: string
}
