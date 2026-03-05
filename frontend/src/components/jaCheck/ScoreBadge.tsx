import { clsx } from 'clsx'
import { scoreBg, scoreLabel } from '../../utils/formatters'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { ring: 'w-12 h-12', text: 'text-sm', sub: 'text-[9px]' },
  md: { ring: 'w-16 h-16', text: 'text-lg', sub: 'text-[10px]' },
  lg: { ring: 'w-24 h-24', text: 'text-2xl', sub: 'text-xs' },
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const s = sizes[size]
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-full text-white font-bold shadow-md',
        scoreBg(score),
        s.ring,
        className,
      )}
    >
      <span className={s.text}>{score}</span>
      <span className={clsx('opacity-80 font-normal', s.sub)}>/ 100</span>
    </div>
  )
}

interface ScoreBarProps {
  score: number
  label?: string
}

export function ScoreBar({ score, label }: ScoreBarProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-semibold text-slate-700">{score} — {scoreLabel(score)}</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', scoreBg(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
