import type { JaImprovementTrend } from '../../types'
import { fmt } from '../../utils/formatters'

interface TrendChartProps {
  trend: JaImprovementTrend[]
}

export function TrendChart({ trend }: TrendChartProps) {
  if (trend.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">まだデータがありません</p>
  }

  const maxAbs = Math.max(...trend.map((t) => Math.abs(t.deltaIssueCount)), 1)
  const barH = 80 // px

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1.5 min-w-max pt-2">
        {trend.map((point, i) => {
          const isNeg = point.deltaIssueCount < 0
          const height = Math.max(4, Math.round((Math.abs(point.deltaIssueCount) / maxAbs) * barH))

          return (
            <div key={i} className="flex flex-col items-center gap-1 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap mb-1">
                {fmt.dateShort(point.date)}: {point.deltaIssueCount > 0 ? '+' : ''}{point.deltaIssueCount}件
              </div>

              {/* Bar */}
              <div
                className={`w-6 rounded-sm transition-all ${isNeg ? 'bg-emerald-500' : point.deltaIssueCount === 0 ? 'bg-slate-200' : 'bg-red-400'}`}
                style={{ height: `${height}px` }}
              />

              {/* Date label (every 5th) */}
              {i % 5 === 0 && (
                <span className="text-[9px] text-slate-400 rotate-45 mt-1">
                  {fmt.dateShort(point.date)}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        緑 = 問題減少（改善）、赤 = 問題増加
      </p>
    </div>
  )
}
