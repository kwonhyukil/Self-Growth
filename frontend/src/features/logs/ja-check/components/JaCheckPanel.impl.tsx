import { useState } from 'react'
import type { GrowthLog } from '@/types'
import { useJaLatest, useRunJaCheck } from '@/features/logs/ja-check/queries'
import { ScoreBadge, ScoreBar } from './ScoreBadge'
import { IssueCard } from './IssueCard'
import { Button } from '@/shared/ui/Button'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { Spinner } from '@/shared/ui/Spinner'
import { RewritePanel } from '@/features/logs/ja-check/revision/components/RewritePanel'

const STYLE_LABEL: Record<string, string> = {
  casual: 'カジュアル体',
  polite: '丁寧体',
  mixed: '混合体',
  keep_mixed: '混合のまま',
  unify_polite: '丁寧体に統一',
  unify_casual: 'カジュアル体に統一',
}

interface JaCheckPanelProps {
  log: GrowthLog
}

export function JaCheckPanel({ log }: JaCheckPanelProps) {
  const { data: latest, isLoading: latestLoading } = useJaLatest(log.id)
  const runCheck = useRunJaCheck(log.id)
  const [showRewrite, setShowRewrite] = useState(false)

  if (!log.praiseJa?.trim()) {
    return (
      <div className="space-y-4 rounded-xl border border-dashed border-border bg-surface-subtle p-6 text-center">
        <div className="text-3xl">✍</div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-main">일본어 문장을 추가하면 Feedback Agent를 사용할 수 있습니다.</p>
          <p className="text-sm text-text-sub">
            먼저 Edit 단계에서 일본어 문장을 적거나 AI 초안을 만든 뒤 다시 돌아오세요.
          </p>
        </div>
      </div>
    )
  }

  if (latestLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner size="md" variant="levels" />
      </div>
    )
  }

  const feedback = latest?.issuesJson ?? (runCheck.data ? { overall: runCheck.data.overall, issues: runCheck.data.issues } : null)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary-600">
          Feedback Agent
        </p>
        <p className="text-sm leading-relaxed text-text-sub">
          이 단계에서는 일본어 문장을 점검하고, 문제 지점과 rewrite task를 바탕으로 문장을 더 자연스럽게 다듬습니다.
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-disabled">
          Original Sentence
        </p>
        <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-text-main">
          {log.praiseJa}
        </p>
      </div>

      {!feedback && (
        <div className="space-y-3 py-4 text-center">
          <p className="text-sm text-text-soft">
            Feedback Agent에게 현재 문장을 점검받아보세요.
          </p>
          {runCheck.error && <ErrorMessage error={runCheck.error} />}
          <Button
            onClick={() => runCheck.mutate()}
            isLoading={runCheck.isPending}
            size="lg"
            leftIcon={<span>🤖</span>}
          >
            AI 피드백 받기
          </Button>
          <p className="text-xs text-text-disabled">1분에 최대 10회까지 요청할 수 있습니다.</p>
        </div>
      )}

      {feedback && (
        <div className="space-y-5 animate-slide-up">
          <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-5">
            <div className="flex items-start gap-5">
              <ScoreBadge score={feedback.overall.score} size="lg" />
              <div className="min-w-0 flex-1">
                <ScoreBar score={feedback.overall.score} />
                <p className="mt-3 text-sm leading-relaxed text-text-sub">
                  {feedback.overall.comment}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-text-sub">
                    검출 문체: {STYLE_LABEL[feedback.overall.detectedStyle] ?? feedback.overall.detectedStyle}
                  </span>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-primary-700">
                    추천: {STYLE_LABEL[feedback.overall.recommendedStyle] ?? feedback.overall.recommendedStyle}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3">
              <p className="mb-1 text-xs font-semibold text-primary-700">Coach Question</p>
              <p className="text-sm italic text-primary-800">
                &ldquo;{feedback.overall.nextStepQuestion}&rdquo;
              </p>
            </div>
          </div>

          {feedback.issues.length > 0 ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-sub">
                개선 포인트 ({feedback.issues.length}개)
              </h3>
              <div className="space-y-3">
                {feedback.issues.map((issue, i) => (
                  <IssueCard key={issue.issueId} issue={issue} index={i} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-4 text-center">
              <p className="font-medium text-success-700">🎉 눈에 띄는 문제를 찾지 못했습니다.</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => runCheck.mutate()}
              isLoading={runCheck.isPending}
              size="sm"
            >
              다시 점검하기
            </Button>
            {feedback.issues.length > 0 && (
              <Button
                onClick={() => setShowRewrite(true)}
                size="sm"
                leftIcon={<span>✏️</span>}
              >
                Rewrite 열기
              </Button>
            )}
          </div>

          {runCheck.error && <ErrorMessage error={runCheck.error} />}
        </div>
      )}

      {showRewrite && (
        <RewritePanel
          log={log}
          latestFeedback={feedback}
          onClose={() => setShowRewrite(false)}
        />
      )}
    </div>
  )
}
