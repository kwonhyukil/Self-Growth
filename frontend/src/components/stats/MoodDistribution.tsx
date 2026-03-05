import type { MoodCount, MoodTag } from '../../types'
import { MOOD_EMOJI, MOOD_LABELS } from '../../utils/constants'

interface MoodDistributionProps {
  moodCount: MoodCount
}

export function MoodDistribution({ moodCount }: MoodDistributionProps) {
  const total = Object.values(moodCount).reduce((a, b) => a + b, 0)
  const sorted = (Object.entries(moodCount) as [MoodTag, number][])
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  if (total === 0) return <p className="text-sm text-slate-400 py-4 text-center">データなし</p>

  return (
    <div className="space-y-2">
      {sorted.map(([mood, count]) => {
        const pct = Math.round((count / total) * 100)
        return (
          <div key={mood} className="flex items-center gap-3">
            <span className="text-base w-6 text-center">{MOOD_EMOJI[mood]}</span>
            <span className="text-xs text-slate-600 w-16 shrink-0">{MOOD_LABELS[mood]}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right tabular-nums">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
