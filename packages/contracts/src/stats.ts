import type { MoodTag } from './common'

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
