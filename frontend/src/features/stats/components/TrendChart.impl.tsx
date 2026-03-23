import type { JaImprovementTrend } from '@/types'
import { fmt } from '@/shared/lib/formatters'

interface TrendChartProps {
  trend: JaImprovementTrend[]
}

export function TrendChart({ trend }: TrendChartProps) {
  if (trend.length === 0) {
    return <p className="py-4 text-center text-sm text-text-disabled">아직 표시할 교정 추세가 없습니다.</p>
  }

  const maxAbs = Math.max(...trend.map((t) => Math.abs(t.deltaIssueCount)), 1)
  const barH = 88

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-end gap-2 pt-2">
        {trend.map((point, index) => {
          const isImproved = point.deltaIssueCount < 0
          const isFlat = point.deltaIssueCount === 0
          const height = Math.max(6, Math.round((Math.abs(point.deltaIssueCount) / maxAbs) * barH))

          return (
            <div key={index} className="group flex flex-col items-center gap-1">
              <div className="mb-1 rounded-full bg-text-main px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {fmt.dateShort(point.date)} · {point.deltaIssueCount > 0 ? '+' : ''}
                {point.deltaIssueCount}
              </div>

              <div
                className={`w-7 rounded-t-[0.7rem] transition-all ${
                  isImproved ? 'bg-success-500' : isFlat ? 'bg-surface-emphasis' : 'bg-accent-400'
                }`}
                style={{ height: `${height}px` }}
              />

              {index % 4 === 0 && (
                <span className="mt-1 text-[9px] text-text-disabled">{fmt.dateShort(point.date)}</span>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs text-text-soft">
        초록은 문제 감소, 주황은 문제 증가를 뜻합니다.
      </p>
    </div>
  )
}
