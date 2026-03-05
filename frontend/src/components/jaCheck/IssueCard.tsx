import { useState } from 'react'
import { clsx } from 'clsx'
import type { JaIssue } from '../../types'
import { RULE_TAG_LABEL, SEVERITY_COLOR, SEVERITY_LABEL } from '../../utils/constants'
import { Badge } from '../ui/Badge'

interface IssueCardProps {
  issue: JaIssue
  index: number
}

export function IssueCard({ issue, index }: IssueCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={clsx(
        'rounded-xl border transition-all',
        SEVERITY_COLOR[issue.severity],
      )}
    >
      {/* Header (always visible) */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-current/10 text-xs font-bold">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline" className={SEVERITY_COLOR[issue.severity]}>
              {SEVERITY_LABEL[issue.severity]}
            </Badge>
            <Badge variant="outline" className="bg-white/60 text-slate-600 border-slate-300">
              {RULE_TAG_LABEL[issue.ruleTag]}
            </Badge>
          </div>
          <p className="text-sm font-medium">{issue.problem}</p>
        </div>
        <svg
          className={clsx('w-4 h-4 shrink-0 mt-0.5 transition-transform', open && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-current/10 px-4 pb-4 pt-3 space-y-3 animate-fade-in">
          <Detail label="なぜ？" value={issue.why} />
          <Detail label="自己チェック" value={issue.selfCheckQuestion} />
          <Detail label="書き直しタスク" value={issue.rewriteTask} />

          {issue.exampleFixes && issue.exampleFixes.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 opacity-70">修正例</p>
              <ul className="space-y-1">
                {issue.exampleFixes.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 mt-0.5 text-current/50">✓</span>
                    <span className="bg-white/50 rounded px-2 py-0.5 font-medium">{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-60">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}
