import api from '@/shared/api/client'
import type {
  JaCheckResponse,
  JaCheckResult,
  JaCheckResultSummary,
  RewriteResponse,
  RevisionDetail,
  RevisionSummary,
} from '@/types'

export const jaCheckApi = {
  /** POST /logs/:id/check-ja — run AI feedback */
  run: async (logId: number): Promise<JaCheckResponse> => {
    const res = await api.post<{ data: JaCheckResponse }>(`/logs/${logId}/check-ja`)
    return res.data.data
  },

  /** GET /logs/:id/check-ja/latest */
  getLatest: async (logId: number): Promise<JaCheckResult | null> => {
    const res = await api.get<{ data: { result: JaCheckResult | null } }>(
      `/logs/${logId}/check-ja/latest`,
    )
    return res.data.data.result
  },

  /** GET /logs/:id/check-ja/results */
  listResults: async (logId: number, take = 20): Promise<JaCheckResultSummary[]> => {
    const res = await api.get<{ data: { results: JaCheckResultSummary[] } }>(
      `/logs/${logId}/check-ja/results`,
      { params: { take } },
    )
    return res.data.data.results
  },

  /** GET /logs/check-ja/results/:resultId */
  getResult: async (resultId: number): Promise<JaCheckResult> => {
    const res = await api.get<{ data: { result: JaCheckResult } }>(
      `/logs/check-ja/results/${resultId}`,
    )
    return res.data.data.result
  },

  /** POST /logs/:id/rewrite-ja — submit revised text */
  rewrite: async (logId: number, revisedText: string): Promise<RewriteResponse> => {
    const res = await api.post<{ data: RewriteResponse }>(`/logs/${logId}/rewrite-ja`, {
      revisedText,
    })
    return res.data.data
  },

  /** GET /logs/:id/revisions */
  listRevisions: async (logId: number, take = 20): Promise<RevisionSummary[]> => {
    const res = await api.get<{ data: { revisions: RevisionSummary[] } }>(
      `/logs/${logId}/revisions`,
      { params: { take } },
    )
    return res.data.data.revisions
  },

  /** GET /revisions/:revisionId */
  getRevision: async (revisionId: number): Promise<RevisionDetail> => {
    const res = await api.get<{ data: { revision: RevisionDetail } }>(
      `/revisions/${revisionId}`,
    )
    return res.data.data.revision
  },
}
