import type { MoodTag, RuleTag, Severity } from '@/types'

export const JA_MIN_LEN = 20
export const JA_MAX_LEN = 200

export const MOOD_LABELS: Record<MoodTag, string> = {
  JOY: '喜び',
  PROUD: '誇り',
  GRATEFUL: '感謝',
  RELIEVED: '安堵',
  EXCITED: '興奮',
  CALM: '穏やか',
  CONFIDENT: '自信',
  MOTIVATED: 'やる気',
  CONNECTED: 'つながり',
  HOPEFUL: '希望',
}

export const MOOD_EMOJI: Record<MoodTag, string> = {
  JOY: '😊',
  PROUD: '💪',
  GRATEFUL: '🙏',
  RELIEVED: '😮‍💨',
  EXCITED: '🎉',
  CALM: '😌',
  CONFIDENT: '🦁',
  MOTIVATED: '🔥',
  CONNECTED: '🤝',
  HOPEFUL: '🌱',
}

export const MOOD_COLOR: Record<MoodTag, string> = {
  JOY: 'bg-yellow-100 text-yellow-800',
  PROUD: 'bg-purple-100 text-purple-800',
  GRATEFUL: 'bg-green-100 text-green-800',
  RELIEVED: 'bg-blue-100 text-blue-800',
  EXCITED: 'bg-orange-100 text-orange-800',
  CALM: 'bg-teal-100 text-teal-800',
  CONFIDENT: 'bg-indigo-100 text-indigo-800',
  MOTIVATED: 'bg-red-100 text-red-800',
  CONNECTED: 'bg-pink-100 text-pink-800',
  HOPEFUL: 'bg-emerald-100 text-emerald-800',
}

export const RULE_TAG_LABEL: Record<RuleTag, string> = {
  particle: '助詞',
  politeness: '敬語',
  word_choice: '語彙選択',
  word_order: '語順',
  collocation: '連語',
  style_mix: 'スタイル混合',
  naturalness: '自然さ',
  kanji_kana: '漢字・かな',
  other: 'その他',
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  low: '軽微',
  medium: '中程度',
  high: '重要',
}

export const MOOD_COLOR_HEX: Record<MoodTag, string> = {
  JOY:       '#FCD34D',
  PROUD:     '#C084FC',
  GRATEFUL:  '#6EE7B7',
  RELIEVED:  '#93C5FD',
  EXCITED:   '#F97316',
  CALM:      '#A5B4FC',
  CONFIDENT: '#34D399',
  MOTIVATED: '#F472B6',
  CONNECTED: '#FDE68A',
  HOPEFUL:   '#86EFAC',
}

export const MOOD_FEEDBACK: Record<MoodTag, string> = {
  JOY:       '喜びを感じた瞬間を言葉にしてみましょう',
  PROUD:     '自分を誇りに思う気持ち、大切にしてください',
  GRATEFUL:  '感謝の気持ちを言葉にすると、さらに深まります',
  RELIEVED:  '安堵できたこと、それだけで十分な成長です',
  EXCITED:   'その興奮をそのまま言葉にしてみてください',
  CALM:      '落ち着いた気持ちも成長の証です',
  CONFIDENT: 'その自信が次のチャレンジを生みます',
  MOTIVATED: 'その意欲がエネルギーになります',
  CONNECTED: 'つながりを感じた瞬間、大切にしましょう',
  HOPEFUL:   '希望を持つこと、それが成長の第一歩です',
}
