import api from '@/shared/api/client'

export type DogLevel = 'BABY' | 'JUNIOR' | 'SENIOR' | 'MASTER'
export type DogEmotion = 'HAPPY' | 'NEUTRAL' | 'SAD'

export interface GrowthSnapshot {
  id: number
  userId: number
  dogLevel: DogLevel
  dogEmotion: DogEmotion
  // Radar axes (0-100)
  vocabulary: number
  grammarAccuracy: number
  consistency: number
  positivity: number
  revisionEffort: number
  verbalizationClarity: number
  // 6축 평균
  radarAvgScore: number
  computedAt: string
  updatedAt: string
}

export const growthApi = {
  getSnapshot: async (): Promise<GrowthSnapshot> => {
    const res = await api.get<{ data: { growth: GrowthSnapshot } }>('/stats/growth')
    return res.data.data.growth
  },

  refresh: async (): Promise<GrowthSnapshot> => {
    const res = await api.post<{ data: { growth: GrowthSnapshot } }>('/stats/growth/refresh')
    return res.data.data.growth
  },
}
