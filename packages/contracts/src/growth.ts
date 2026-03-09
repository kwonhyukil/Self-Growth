export type DogLevel = 'BABY' | 'JUNIOR' | 'SENIOR' | 'MASTER'
export type DogEmotion = 'HAPPY' | 'NEUTRAL' | 'SAD'

export interface GrowthSnapshot {
  id: number
  userId: number
  dogLevel: DogLevel
  dogEmotion: DogEmotion
  vocabulary: number
  grammarAccuracy: number
  consistency: number
  positivity: number
  revisionEffort: number
  verbalizationClarity: number
  radarAvgScore: number
  computedAt: string
  updatedAt: string
}
