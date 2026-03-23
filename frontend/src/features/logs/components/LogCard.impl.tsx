import { Link } from 'react-router-dom'
import type { GrowthLog } from '@/types'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLOR } from '@/shared/lib/constants'
import { fmt } from '@/shared/lib/formatters'
import { Badge } from '@/shared/ui/Badge'

interface LogCardProps {
  log: GrowthLog
}

export function LogCard({ log }: LogCardProps) {
  return (
    <Link to={`/logs/${log.id}`} className="activity-card group block">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Badge className={MOOD_COLOR[log.moodTag]}>
          {MOOD_EMOJI[log.moodTag]} {MOOD_LABELS[log.moodTag]}
        </Badge>
        <time className="shrink-0 text-caption text-text-disabled">{fmt.date(log.happenedAt)}</time>
      </div>

      <p className="section-label mb-1">きっかけ</p>
      <p className="mb-4 line-clamp-2 text-bodySm text-text-main">{log.triggerKo}</p>

      <div className="rounded-panel border border-border-subtle bg-surface-subtle px-4 py-3">
        <p className="mb-1 text-caption text-text-soft">日本語の振り返り</p>
        {log.praiseJa ? (
          <p className="line-clamp-2 text-bodySm font-medium text-text-main">{log.praiseJa}</p>
        ) : (
          <p className="line-clamp-2 text-bodySm italic text-text-disabled">
            まだ日本語の振り返りはありません
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-caption">
        <span className="text-text-disabled">{fmt.fromNow(log.createdAt)}</span>
        <span className="font-semibold text-primary-600 transition-colors group-hover:text-primary-700">詳細を見る</span>
      </div>
    </Link>
  )
}
