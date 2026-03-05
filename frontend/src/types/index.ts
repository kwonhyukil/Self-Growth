// ─── Enums ────────────────────────────────────────────────────────────────────

export type MoodTag =
  | 'JOY'
  | 'PROUD'
  | 'GRATEFUL'
  | 'RELIEVED'
  | 'EXCITED'
  | 'CALM'
  | 'CONFIDENT'
  | 'MOTIVATED'
  | 'CONNECTED'
  | 'HOPEFUL'

export const MOOD_TAGS: MoodTag[] = [
  'JOY', 'PROUD', 'GRATEFUL', 'RELIEVED', 'EXCITED',
  'CALM', 'CONFIDENT', 'MOTIVATED', 'CONNECTED', 'HOPEFUL',
]

export type RuleTag =
  | 'particle'
  | 'politeness'
  | 'word_choice'
  | 'word_order'
  | 'collocation'
  | 'style_mix'
  | 'naturalness'
  | 'kanji_kana'
  | 'other'

export type Severity = 'low' | 'medium' | 'high'
export type DetectedStyle = 'casual' | 'polite' | 'mixed'
export type RecommendedStyle = 'keep_mixed' | 'unify_polite' | 'unify_casual'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  name: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface SignupBody {
  email: string
  password: string
  name: string
}

// ─── Growth Log ───────────────────────────────────────────────────────────────

export interface GrowthLog {
  id: number
  userId: number
  happenedAt: string
  moodTag: MoodTag
  triggerKo: string
  praiseKo: string
  praiseJa: string
  createdAt: string
  updatedAt: string
}

export interface CreateLogBody {
  happenedAt: string       // ISO 8601 datetime
  moodTag: MoodTag
  triggerKo: string        // 1–200 chars
  praiseKo: string         // 1+ chars
  praiseJa: string         // 1+ chars
}

export type UpdateLogBody = Partial<CreateLogBody>

// ─── JA Check ─────────────────────────────────────────────────────────────────

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
  score: number                      // 0–100
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

// ─── Revision ─────────────────────────────────────────────────────────────────

export interface RevisionSide {
  resultId: number | null
  score: number | null
  issueCount: number | null
  feedback?: JaCheckPayload | null
}

export interface RevisionDelta {
  issueCount: number | null
  score: number | null
}

export interface RevisionCompare {
  resolvedIssues: JaIssue[]
  remainingIssues: JaIssue[]
  newIssues: JaIssue[]
}

export interface RewriteResponse {
  revisionId: number
  logId: number
  before: RevisionSide
  after: RevisionSide & { resultId: number; score: number; issueCount: number }
  delta: RevisionDelta
}

export interface RevisionSummary {
  id: number
  createdAt: string
  toolName: string
  beforeResultId: number | null
  afterResultId: number
  beforeScore: number | null
  afterScore: number
  beforeIssueCount: number | null
  afterIssueCount: number
  deltaIssueCount: number | null
}

export interface RevisionDetail {
  id: number
  logId: number
  createdAt: string
  toolName: string
  beforeText: string
  afterText: string
  before: RevisionSide
  after: RevisionSide & { resultId: number; score: number; issueCount: number }
  delta: RevisionDelta
  compare: RevisionCompare
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export type MoodCount = Record<MoodTag, number>

export interface SummaryStats {
  totalLogs: number
  last7DaysCount: number
  moodCount: MoodCount
  recentLogs: Array<{
    id: number
    happenedAt: string
    moodTag: string
    triggerKo: string
    createdAt: string
  }>
  streak: number
  dashboard: Record<string, unknown>
}

export interface JaImprovementTrend {
  date: string
  deltaIssueCount: number
  revisions: number
  cumulativeDeltaIssueCount: number
}

export interface JaImprovementStats {
  days: number
  totalRevisions: number
  totalDeltaIssueCount: number
  avgDeltaIssueCount: number
  severityDistribution: { low: number; medium: number; high: number }
  ruleTagTop: Array<{ ruleTag: string; count: number }>
  trend: JaImprovementTrend[]
}

export interface CoachFocus {
  focusRuleTag: string
  why: string
  oneAction: string
  nextQuestion: string
}

export interface DashboardStats {
  ja: {
    d7: Record<string, unknown>
    d30: Record<string, unknown>
  }
  insights: {
    weekTopFocus: { ruleTag: string; message: string; action: string }
    monthTopFocus: { ruleTag: string; message: string; action: string }
    nextTargets: Array<{ ruleTag: string; message: string }>
  }
  coach: {
    week: CoachFocus
    month: CoachFocus
  }
  dataQuality: {
    totalRevisions30d: number
    nullDeltaCount30d: number
    zeroDeltaCount30d: number
  }
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
