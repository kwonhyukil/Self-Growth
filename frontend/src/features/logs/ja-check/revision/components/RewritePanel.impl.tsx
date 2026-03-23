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
    <div className="journal-frame border-primary-100 bg-primary-50/55 p-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="agent-pill">Editorial Coach</p>
          <h3 className="mt-3 text-h3">Rewrite with guidance</h3>
        </div>
        <button onClick={onClose} className="text-sm text-text-disabled transition-colors hover:text-text-sub">
          닫기
        </button>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-white/70 bg-white/60 px-4 py-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
          Original Sentence
        </p>
        <p className="text-sm leading-relaxed text-text-sub">{log.praiseJa}</p>
      </div>

      {latestFeedback && latestFeedback.issues.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-600">
            Rewrite Tasks
          </p>
          <div className="space-y-2">
            {latestFeedback.issues.slice(0, 3).map((issue) => (
              <div
                key={issue.issueId}
                className="flex items-start gap-2 rounded-[1.1rem] border border-white/60 bg-white/55 px-4 py-3 text-sm text-text-sub"
              >
                <span className="mt-0.5 text-primary-600">•</span>
                <span>{issue.rewriteTask}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Textarea
          label="다듬은 일본어 문장"
          value={revisedText}
          onChange={(e) => setRevisedText(e.target.value)}
          rows={4}
          charCount={len}
          maxChars={JA_MAX_LEN}
          hint={`${JA_MIN_LEN}〜${JA_MAX_LEN}자 범위`}
          error={
            len > 0 && invalid
              ? `${JA_MIN_LEN}〜${JA_MAX_LEN}자 범위로 맞춰주세요 (현재 ${len}자)`
              : undefined
          }
        />

        {rewrite.error && <ErrorMessage error={rewrite.error} />}

        {rewrite.data && (
          <div className="rounded-[1.4rem] border border-success-200 bg-white/65 p-4 shadow-soft animate-slide-up">
            <p className="text-sm font-semibold text-text-sub">Rewrite result</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-center">
                <p className="mb-1 text-xs text-text-disabled">Before</p>
                {rewrite.data.before.score !== null ? (
                  <ScoreBadge score={rewrite.data.before.score} size="sm" />
                ) : (
                  <span className="text-sm text-text-disabled">—</span>
                )}
              </div>
              <div className="flex-1 text-center">
                <p
                  className={clsx(
                    'text-sm font-bold',
                    (rewrite.data.delta.issueCount ?? 0) < 0 ? 'text-success-600' : 'text-text-soft',
                  )}
                >
                  {deltaLabel(rewrite.data.delta.issueCount)}
                </p>
              </div>
              <div className="text-center">
                <p className="mb-1 text-xs text-text-disabled">After</p>
                <ScoreBadge score={rewrite.data.after.score} size="sm" />
              </div>
            </div>
          </div>
        )}

        <Button type="submit" isLoading={rewrite.isPending} disabled={invalid} className="w-full">
          Rewrite 제출하고 다시 피드백 받기
        </Button>
      </form>

      {revisions && revisions.length > 0 && (
        <div className="mt-5">
          <RevisionHistory logId={log.id} revisions={revisions} />
        </div>
      )}
    </div>
  )
}
