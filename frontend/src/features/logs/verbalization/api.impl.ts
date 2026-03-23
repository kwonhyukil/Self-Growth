import api from '@/shared/api/client'
import type { BrainstormResult, InsightResult, VerbalizationSession } from '@/types'

export const verbalizationApi = {
  getSession: async (logId: number): Promise<VerbalizationSession | null> => {
    const res = await api.get<{ data: { verbalization: VerbalizationSession | null } }>(
      `/ai/insight/logs/${logId}/session`
    )
    return res.data.data.verbalization
  },

  startBrainstorm: async (
    logId: number,
    rawThoughts: string,
    thinkingDurationMs?: number
  ): Promise<BrainstormResult> => {
    const res = await api.post<{ data: { verbalization: BrainstormResult } }>(
      `/ai/insight/logs/${logId}/brainstorm`,
      { rawThoughts, thinkingDurationMs }
    )
    return res.data.data.verbalization
  },

  submitProbeAnswer: async (
    logId: number,
    probingAnswer: string
  ): Promise<InsightResult> => {
    const res = await api.post<{ data: { verbalization: InsightResult } }>(
      `/ai/insight/logs/${logId}/answer`,
      { probingAnswer }
    )
    return res.data.data.verbalization
  },
}
