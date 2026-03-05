import { Link } from 'react-router-dom'
import type { GrowthLog } from '../../types'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLOR } from '../../utils/constants'
import { fmt } from '../../utils/formatters'
import { Badge } from '../ui/Badge'

interface LogCardProps {
  log: GrowthLog
}

export function LogCard({ log }: LogCardProps) {
  return (
    <Link
      to={`/logs/${log.id}`}
      className="group block rounded-xl border border-surface-border bg-white p-5 hover:border-brand-300 hover:shadow-md transition-all"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge className={MOOD_COLOR[log.moodTag]}>
            {MOOD_EMOJI[log.moodTag]} {MOOD_LABELS[log.moodTag]}
          </Badge>
        </div>
        <time className="shrink-0 text-xs text-slate-400">
          {fmt.date(log.happenedAt)}
        </time>
      </div>

      {/* Trigger */}
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-1">きっかけ</p>
      <p className="text-sm text-slate-700 line-clamp-2 mb-3">{log.triggerKo}</p>

      {/* Japanese praise preview */}
      <div className="rounded-lg bg-surface-subtle px-3 py-2">
        <p className="text-xs text-slate-400 mb-0.5">自己称賛（日本語）</p>
        <p className="text-sm text-slate-800 line-clamp-2 font-medium">{log.praiseJa}</p>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>記録: {fmt.fromNow(log.createdAt)}</span>
        <span className="text-brand-600 group-hover:underline font-medium">詳細 →</span>
      </div>
    </Link>
  )
}
