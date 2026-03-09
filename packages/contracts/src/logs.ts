import type { MoodTag } from './common'

export interface GrowthLog {
  id: number
  userId: number
  happenedAt: string
  moodTag: MoodTag
  triggerKo: string
  specificEvent?: string | null
  moodIntensity?: number | null
  praiseKo: string
  praiseJa: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateLogBody {
  happenedAt: string
  moodTag: MoodTag
  triggerKo: string
  specificEvent?: string
  moodIntensity?: number
  praiseKo: string
  praiseJa?: string
}

export type UpdateLogBody = Partial<CreateLogBody>
