import { Link } from 'react-router-dom'
import type { GrowthLog } from '@/types'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLOR } from '@/shared/lib/constants'
import { fmt } from '@/shared/lib/formatters'
import { Badge } from '@/shared/ui/Badge'

interface LogCardProps {
  log: GrowthLog
}

export function LogCard({ log }: LogCardProps) {
  const hasJa = Boolean(log.praiseJa?.trim())

  return (
    <Link to={`/logs/${log.id}`} className="activity-card group block overflow-hidden">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge className={MOOD_COLOR[log.moodTag]}>
            {MOOD_EMOJI[log.moodTag]} {MOOD_LABELS[log.moodTag]}
          </Badge>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
            {fmt.fromNow(log.createdAt)}
          </p>
        </div>
        <time className="shrink-0 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-caption text-text-disabled">
          {fmt.date(log.happenedAt)}
        </time>
      </div>

      <div className="space-y-4">
        <div>
          <p className="section-label mb-2">Scene</p>
          <p className="line-clamp-3 text-bodySm leading-relaxed text-text-main">{log.triggerKo}</p>
        </div>

        <div className="rounded-[1.4rem] border border-white/70 bg-white/60 px-4 py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
            Japanese Reflection
          </p>
          {hasJa ? (
            <p className="line-clamp-3 text-bodySm font-medium leading-relaxed text-text-main">
              {log.praiseJa}
            </p>
          ) : (
            <p className="line-clamp-2 text-bodySm italic leading-relaxed text-text-disabled">
              아직 일본어 문장이 없습니다. 이 로그는 Edit 단계에서 문장을 정리한 뒤 Feedback Agent로 이어질 수 있습니다.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] text-text-sub">
            {hasJa ? 'Feedback ready' : 'Edit first'}
          </span>
          <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] text-text-sub">
            Insight available
          </span>
        </div>
        <span className="text-sm font-semibold text-primary-700 transition-colors group-hover:text-primary-800">
          Open journal →
        </span>
      </div>
    </Link>
  )
}
