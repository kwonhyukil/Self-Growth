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
        <div className="text-3xl">✍️</div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-text-main">日本語の振り返りを追加するとAIフィードバックを受けられます</p>
          <p className="text-sm text-text-sub">
            まずは編集タブで日本語の文を入力するか、AI下書きを使って出発点を作ってください。
          </p>
        </div>
      </div>
    )
  }

  if (latestLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    )
  }

  const feedback = latest?.issuesJson ?? (
    runCheck.data
      ? { overall: runCheck.data.overall, issues: runCheck.data.issues }
      : null
  )

  return (
    <div className="space-y-6">
      {/* Original text */}
      <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-disabled mb-2">
          記録した日本語
        </p>
        <p className="text-base text-text-main leading-relaxed whitespace-pre-wrap font-medium">
          {log.praiseJa}
        </p>
      </div>

      {/* Run check button (when no feedback) */}
      {!feedback && (
        <div className="text-center space-y-3 py-4">
          <p className="text-sm text-text-soft">
            AIコーチにフィードバックを依頼しましょう
          </p>
          {runCheck.error && <ErrorMessage error={runCheck.error} />}
          <Button
            onClick={() => runCheck.mutate()}
            isLoading={runCheck.isPending}
            size="lg"
            leftIcon={<span>🤖</span>}
          >
            AIフィードバックを受ける
          </Button>
          <p className="text-xs text-text-disabled">※ 1分あたり最大10回まで</p>
        </div>
      )}

      {/* Feedback display */}
      {feedback && (
        <div className="space-y-5 animate-slide-up">
          {/* Overall score */}
          <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-5">
            <div className="flex items-start gap-5">
              <ScoreBadge score={feedback.overall.score} size="lg" />
              <div className="flex-1 min-w-0">
                <ScoreBar score={feedback.overall.score} />
                <p className="mt-3 text-sm text-text-sub leading-relaxed">
                  {feedback.overall.comment}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-text-sub">
                    検出スタイル: {STYLE_LABEL[feedback.overall.detectedStyle] ?? feedback.overall.detectedStyle}
                  </span>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-primary-700">
                    推奨: {STYLE_LABEL[feedback.overall.recommendedStyle] ?? feedback.overall.recommendedStyle}
                  </span>
                </div>
              </div>
            </div>

            {/* Next step question */}
            <div className="mt-4 rounded-lg bg-primary-50 border border-primary-100 px-4 py-3">
              <p className="text-xs font-semibold text-primary-700 mb-1">コーチからの質問</p>
              <p className="text-sm text-primary-800 italic">
                &ldquo;{feedback.overall.nextStepQuestion}&rdquo;
              </p>
            </div>
          </div>

          {/* Issues */}
          {feedback.issues.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-text-sub mb-3">
                改善ポイント ({feedback.issues.length}件)
              </h3>
              <div className="space-y-3">
                {feedback.issues.map((issue, i) => (
                  <IssueCard key={issue.issueId} issue={issue} index={i} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-success-50 border border-success-200 px-4 py-4 text-center">
              <p className="text-success-700 font-medium">🎉 問題は見つかりませんでした！</p>
            </div>
          )}

          {/* Re-check and Rewrite actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => runCheck.mutate()}
              isLoading={runCheck.isPending}
              size="sm"
            >
              再チェック
            </Button>
            {feedback.issues.length > 0 && (
              <Button
                onClick={() => setShowRewrite(true)}
                size="sm"
                leftIcon={<span>✏️</span>}
              >
                書き直す
              </Button>
            )}
          </div>

          {runCheck.error && <ErrorMessage error={runCheck.error} />}
        </div>
      )}

      {/* Rewrite panel */}
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
