import { useState } from 'react'
import type { RevisionSummary } from '../../types'
import { useJaRevisionDetail } from '../../hooks/useJaCheck'
import { fmt, deltaLabel } from '../../utils/formatters'
import { ScoreBadge } from '../jaCheck/ScoreBadge'
import { Spinner } from '../ui/Spinner'
import { clsx } from 'clsx'

interface RevisionHistoryProps {
  logId: number
  revisions: RevisionSummary[]
}

export function RevisionHistory({ revisions }: RevisionHistoryProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        書き直し履歴 ({revisions.length}件)
      </p>
      <div className="space-y-2">
        {revisions.map((rev) => (
          <div key={rev.id}>
            <button
              type="button"
              onClick={() => setSelectedId(selectedId === rev.id ? null : rev.id)}
              className="w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-brand-200 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-slate-400 shrink-0">{fmt.dateShort(rev.createdAt)}</span>
                <div className="flex items-center gap-1.5 text-xs">
                  {rev.beforeScore !== null ? (
                    <span className="text-slate-500">{rev.beforeScore}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                  <span className="text-slate-300">→</span>
                  <span className="font-semibold text-slate-800">{rev.afterScore}</span>
                </div>
                <span className={clsx(
                  'ml-auto text-xs font-medium shrink-0',
                  (rev.deltaIssueCount ?? 0) < 0 ? 'text-emerald-600' : 'text-slate-400'
                )}>
                  {deltaLabel(rev.deltaIssueCount)}
                </span>
              </div>
              <svg
                className={clsx('w-3 h-3 text-slate-400 shrink-0 transition-transform', selectedId === rev.id && 'rotate-180')}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {selectedId === rev.id && (
              <RevisionDetailView revisionId={rev.id} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RevisionDetailView({ revisionId }: { revisionId: number }) {
  const { data, isLoading } = useJaRevisionDetail(revisionId)

  if (isLoading) return (
    <div className="flex justify-center py-4">
      <Spinner size="sm" />
    </div>
  )
  if (!data) return null

  return (
    <div className="rounded-b-lg border border-t-0 border-slate-200 bg-slate-50 px-4 py-3 space-y-3 animate-fade-in">
      {/* Before / After text */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400 mb-1">修正前</p>
          <p className="text-slate-600 bg-white rounded p-2 border border-slate-200">{data.beforeText}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">修正後</p>
          <p className="text-slate-800 bg-white rounded p-2 border border-brand-200 font-medium">{data.afterText}</p>
        </div>
      </div>

      {/* Score comparison */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          {data.before.score !== null ? (
            <ScoreBadge score={data.before.score} size="sm" />
          ) : <span className="text-slate-300 text-sm">—</span>}
          <p className="text-xs text-slate-400 mt-1">前</p>
        </div>
        <div className="flex-1 text-center text-xs font-medium text-slate-500">
          {deltaLabel(data.delta.issueCount)}
        </div>
        <div className="text-center">
          <ScoreBadge score={data.after.score} size="sm" />
          <p className="text-xs text-slate-400 mt-1">後</p>
        </div>
      </div>

      {/* Compare */}
      {data.compare.resolvedIssues.length > 0 && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
          <p className="text-xs font-semibold text-emerald-700 mb-1">
            ✅ 解決した問題 ({data.compare.resolvedIssues.length}件)
          </p>
          {data.compare.resolvedIssues.map((i) => (
            <p key={i.issueId} className="text-xs text-emerald-800 pl-2">• {i.problem}</p>
          ))}
        </div>
      )}
      {data.compare.newIssues.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-xs font-semibold text-amber-700 mb-1">
            ⚠️ 新しい問題 ({data.compare.newIssues.length}件)
          </p>
          {data.compare.newIssues.map((i) => (
            <p key={i.issueId} className="text-xs text-amber-800 pl-2">• {i.problem}</p>
          ))}
        </div>
      )}
    </div>
  )
}
