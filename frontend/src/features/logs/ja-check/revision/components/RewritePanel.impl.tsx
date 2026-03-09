import { useState } from 'react'
import type { GrowthLog, JaCheckPayload } from '@/types'
import { JA_MIN_LEN, JA_MAX_LEN } from '@/shared/lib/constants'
import { useRewriteJa, useJaRevisions } from '@/features/logs/ja-check/queries'
import { Button } from '@/shared/ui/Button'
import { Textarea } from '@/shared/ui/Input'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { ScoreBadge } from '@/features/logs/ja-check/components/ScoreBadge'
import { deltaLabel } from '@/shared/lib/formatters'
import { RevisionHistory } from './RevisionHistory'
import { clsx } from 'clsx'

interface RewritePanelProps {
  log: GrowthLog
  latestFeedback: JaCheckPayload | null
  onClose: () => void
}

export function RewritePanel({ log, latestFeedback, onClose }: RewritePanelProps) {
  const [revisedText, setRevisedText] = useState(log.praiseJa ?? '')
  const rewrite = useRewriteJa(log.id)
  const { data: revisions } = useJaRevisions(log.id)

  const len = revisedText.length
  const invalid = len < JA_MIN_LEN || len > JA_MAX_LEN

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (invalid) return
    await rewrite.mutateAsync(revisedText.trim())
  }

  return (
    <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-5 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-800 flex items-center gap-2">
          <span>✏️</span> 書き直しモード
        </h3>
        <button
          onClick={onClose}
          className="text-text-disabled hover:text-text-sub text-sm"
        >
          ✕ 閉じる
        </button>
      </div>

      {/* Original */}
      <div className="rounded-lg bg-surface-elevated/70 px-4 py-3 border border-primary-100">
        <p className="text-xs text-text-disabled mb-1">元のテキスト</p>
        <p className="text-sm text-text-sub">{log.praiseJa}</p>
      </div>

      {/* Issues to address */}
      {latestFeedback && latestFeedback.issues.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary-700">修正すべき点:</p>
          {latestFeedback.issues.slice(0, 3).map((issue) => (
            <div key={issue.issueId} className="flex items-start gap-2 text-xs text-primary-800">
              <span className="shrink-0 mt-0.5">•</span>
              <span>{issue.rewriteTask}</span>
            </div>
          ))}
        </div>
      )}

      {/* Rewrite form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="書き直した文章"
          value={revisedText}
          onChange={(e) => setRevisedText(e.target.value)}
          rows={4}
          charCount={len}
          maxChars={JA_MAX_LEN}
          hint={`${JA_MIN_LEN}〜${JA_MAX_LEN}文字`}
          error={
            len > 0 && invalid
              ? `${JA_MIN_LEN}〜${JA_MAX_LEN}文字にしてください（現在 ${len} 文字）`
              : undefined
          }
        />

        {rewrite.error && <ErrorMessage error={rewrite.error} />}

        {/* Result */}
        {rewrite.data && (
          <div className="rounded-xl bg-surface-elevated border border-success-200 p-4 space-y-2 animate-slide-up">
            <p className="text-sm font-semibold text-text-sub">書き直し結果</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-text-disabled mb-1">前</p>
                {rewrite.data.before.score !== null ? (
                  <ScoreBadge score={rewrite.data.before.score} size="sm" />
                ) : (
                  <span className="text-text-disabled text-sm">—</span>
                )}
              </div>
              <div className="flex-1 text-center">
                <p className={clsx(
                  'text-sm font-bold',
                  (rewrite.data.delta.issueCount ?? 0) < 0 ? 'text-success-600' : 'text-text-soft'
                )}>
                  {deltaLabel(rewrite.data.delta.issueCount)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-disabled mb-1">後</p>
                <ScoreBadge score={rewrite.data.after.score} size="sm" />
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          isLoading={rewrite.isPending}
          disabled={invalid}
          className="w-full"
        >
          書き直しを提出してフィードバックを受ける
        </Button>
      </form>

      {/* Revision history */}
      {revisions && revisions.length > 0 && (
        <RevisionHistory logId={log.id} revisions={revisions} />
      )}
    </div>
  )
}
