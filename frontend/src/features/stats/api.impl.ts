import api from '@/shared/api/client'
import type { DashboardStats, JaImprovementStats, MoodCount, SummaryStats } from '@/types'

export const statsApi = {
  summary: async (): Promise<SummaryStats> => {
    const res = await api.get<{ data: SummaryStats }>('/stats/summary')
    return res.data.data
  },

  moodCount: async (): Promise<{ stats: MoodCount }> => {
    const res = await api.get<{ data: { stats: MoodCount } }>('/stats/mood-count')
    return res.data.data
  },

  last7Days: async (): Promise<{ count: number }> => {
    const res = await api.get<{ data: { count: number } }>('/stats/last-7days')
    return res.data.data
  },

  jaImprovement: async (days = 30): Promise<JaImprovementStats> => {
    const res = await api.get<{ data: JaImprovementStats }>('/stats/ja-improvement', {
      params: { days },
    })
    return res.data.data
  },

  dashboard: async (): Promise<DashboardStats> => {
    const res = await api.get<{ data: DashboardStats }>('/stats/dashboard')
    return res.data.data
  },
}
