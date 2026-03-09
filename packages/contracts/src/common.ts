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
