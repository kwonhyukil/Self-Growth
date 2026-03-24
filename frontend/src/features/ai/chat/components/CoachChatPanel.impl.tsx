import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useChatAgent } from '@/features/ai/chat/queries'
import { useLogs } from '@/features/logs/queries'
import { Button } from '@/shared/ui/Button'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { Textarea } from '@/shared/ui/Input'

const QUICK_PROMPTS = [
  '오늘 무엇을 기록하면 좋을까?',
  '최근 로그를 바탕으로 어떤 점을 개선하면 좋을까?',
  '일본어 피드백을 먼저 받아야 할지 알려줘.',
]

function buildRouteTarget(route: 'chat' | 'feedback' | 'insight', logs: ReturnType<typeof useLogs>['data']) {
  const latestLog = logs?.[0]
  const latestFeedbackReadyLog = logs?.find((log) => Boolean(log.praiseJa?.trim()))

  if (route === 'feedback') {
    if (latestFeedbackReadyLog) {
      return {
        to: `/logs/${latestFeedbackReadyLog.id}?tab=feedback`,
        label: 'AI 피드백 열기',
      }
    }

    return {
      to: '/logs',
      label: '로그부터 작성하기',
    }
  }

  if (route === 'insight') {
    if (latestLog) {
      return {
        to: `/logs/${latestLog.id}?tab=verbalize`,
        label: '언어화 열기',
      }
    }

    return {
      to: '/logs',
      label: '먼저 로그 작성하기',
    }
  }

  return {
    to: '/logs',
    label: '새 로그 작성하기',
  }
}

export function CoachChatPanel() {
  const [message, setMessage] = useState('')
  const chat = useChatAgent()
  const { data: logs } = useLogs()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    await chat.mutateAsync({ message: message.trim() })
  }

  const routeTarget = chat.data ? buildRouteTarget(chat.data.route, logs) : null

  return (
    <div className="space-y-4">
      <div className="rounded-[1.4rem] border border-primary-100 bg-primary-50/50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
          AI Coach
        </p>
        <p className="text-sm leading-relaxed text-text-sub">
          기록을 어디서 시작할지, 지금 피드백을 받을지, 언어화를 먼저 볼지 코치에게 물어보세요.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setMessage(prompt)}
            className="rounded-full border border-border-subtle bg-surface-subtle px-3 py-1.5 text-xs text-text-sub transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          label="코치에게 질문하기"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxChars={500}
          charCount={message.length}
          placeholder="예: 최근에 같은 실수를 반복하는 것 같은데, 어디부터 고치면 좋을까?"
        />
        <Button type="submit" isLoading={chat.isPending} disabled={!message.trim()}>
          코치에게 물어보기
        </Button>
      </form>

      {chat.error && <ErrorMessage error={chat.error} />}

      {chat.data && (
        <div className="space-y-3 rounded-[1.4rem] border border-border-subtle bg-surface-subtle p-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-disabled">
              Reply
            </p>
            <p className="text-sm leading-relaxed text-text-main">{chat.data.reply}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-surface-elevated px-3 py-1 text-text-sub">
              intent: {chat.data.intent}
            </span>
            <span className="rounded-full bg-surface-elevated px-3 py-1 text-text-sub">
              route: {chat.data.route}
            </span>
          </div>

          {routeTarget && (
            <div className="rounded-lg border border-primary-100 bg-primary-50/60 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-600">
                Recommended Action
              </p>
              <Link to={routeTarget.to}>
                <Button size="sm">{routeTarget.label}</Button>
              </Link>
            </div>
          )}

          {chat.data.suggestedActions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-disabled">
                Suggested Next Steps
              </p>
              <ul className="space-y-2 text-sm text-text-sub">
                {chat.data.suggestedActions.map((action) => (
                  <li key={action} className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary-500">•</span>
                    <span>{action}</span>
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
