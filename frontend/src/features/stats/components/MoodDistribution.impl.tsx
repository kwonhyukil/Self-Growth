import type { MoodCount, MoodTag } from '@/types'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLOR_HEX } from '@/shared/lib/constants'

interface MoodDistributionProps {
  moodCount: MoodCount
}

export function MoodDistribution({ moodCount }: MoodDistributionProps) {
  const total = Object.values(moodCount).reduce((a, b) => a + b, 0)
  const sorted = (Object.entries(moodCount) as [MoodTag, number][])
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)

  if (total === 0) {
    return <p className="py-4 text-center text-sm text-text-disabled">아직 기록된 감정이 없습니다.</p>
  }

  return (
    <div className="space-y-2">
      {sorted.map(([mood, count]) => {
        const pct = Math.round((count / total) * 100)
        return (
          <div key={mood} className="flex items-center gap-3 rounded-full border border-white/60 bg-white/45 px-3 py-2">
            <span className="w-6 text-center text-base">{MOOD_EMOJI[mood]}</span>
            <span className="w-16 shrink-0 text-xs text-text-sub">{MOOD_LABELS[mood]}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: MOOD_COLOR_HEX[mood] }}
              />
            </div>
            <span className="w-8 text-right text-xs tabular-nums text-text-soft">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
