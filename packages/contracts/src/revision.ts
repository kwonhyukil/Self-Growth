import type { JaCheckPayload, JaIssue } from './ja-check'

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
