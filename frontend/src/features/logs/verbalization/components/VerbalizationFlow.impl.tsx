import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { useVerbalization, useStartBrainstorm, useSubmitProbeAnswer } from '@/features/logs/verbalization/queries'
import { Button } from '@/shared/ui/Button'
import { Textarea } from '@/shared/ui/Input'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'

interface Props {
  logId: number
}

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={clsx('flex items-center gap-2', !active && !done && 'opacity-40')}>
      <div
        className={clsx(
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
          done ? 'bg-emerald-500 text-white' : active ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500',
        )}
      >
        {done ? '✓' : n}
      </div>
      <span className={clsx('text-xs font-semibold', active ? 'text-slate-800' : 'text-slate-400')}>
        {label}
      </span>
    </div>
  )
}

function CountdownTimer({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const doneRef = useRef(false)

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          if (!doneRef.current) {
            doneRef.current = true
            onDone?.()
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line

  const pct = ((seconds - remaining) / seconds) * 100
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16">
        <svg className="rotate-[-90deg]" viewBox="0 0 36 36" width={64} height={64}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={remaining === 0 ? '#10b981' : '#0284c7'}
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={100 - pct}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-slate-700">
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      {remaining === 0 && <span className="text-xs font-semibold text-emerald-600">시간이 끝났습니다!</span>}
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? '좋아요' : score >= 40 ? '보통' : '더 다듬기'
  const pct = score

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg className="rotate-[-90deg]" viewBox="0 0 36 36" width={96} height={96}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray="100"
            strokeDashoffset={100 - pct}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-800">{score}</span>
          <span className="text-[9px] text-slate-400">/ 100</span>
        </span>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  )
}

export function VerbalizationFlow({ logId }: Props) {
  const { data: session, isLoading } = useVerbalization(logId)
  const brainstorm = useStartBrainstorm(logId)
  const probe = useSubmitProbeAnswer(logId)

  const [rawThoughts, setRawThoughts] = useState('')
  const [probingAnswer, setProbingAnswer] = useState('')
  const [timerStarted, setTimerStarted] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const [startMs, setStartMs] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [restartRequested, setRestartRequested] = useState(false)

  useEffect(() => {
    if (restartRequested) return
    if (session) {
      if (session.rawThoughts) setRawThoughts(session.rawThoughts)
      if (session.probingAnswer) setProbingAnswer(session.probingAnswer)
    }
  }, [restartRequested, session?.id]) // eslint-disable-line

  useEffect(() => {
    if (restartRequested && session?.completedSteps !== 3) {
      setRestartRequested(false)
    }
  }, [restartRequested, session?.completedSteps])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" variant="levels" />
      </div>
    )
  }

  const isDone = !restartRequested && session?.completedSteps === 3

  const handleStartTimer = () => {
    setTimerStarted(true)
    setStartMs(Date.now())
  }

  const handleBrainstormSubmit = async () => {
    if (rawThoughts.trim().length < 10) return
    setError(null)
    const duration = startMs ? Date.now() - startMs : undefined
    try {
      await brainstorm.mutateAsync({ rawThoughts: rawThoughts.trim(), thinkingDurationMs: duration })
      setRestartRequested(false)
    } catch (e) {
      setError(e)
    }
  }

  const handleProbeSubmit = async () => {
    if (probingAnswer.trim().length < 5) return
    setError(null)
    try {
      await probe.mutateAsync(probingAnswer.trim())
    } catch (e) {
      setError(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-500">
          Insight Agent
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          이 단계에서는 생각을 길게 적고 질문에 답하면서, 기록의 의미와 감정을 더 선명하게 정리합니다.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <StepBadge n={1} label="기록" active={false} done={true} />
        <div className="h-px flex-1 bg-slate-200" />
        <StepBadge
          n={2}
          label="브레인덤프"
          active={!isDone && (restartRequested || !session || !session.aiInsightJa)}
          done={isDone || (!!session?.aiInsightJa && !restartRequested)}
        />
        <div className="h-px flex-1 bg-slate-200" />
        <StepBadge
          n={3}
          label="인사이트"
          active={!isDone && !restartRequested && !!session?.probingQuestion}
          done={isDone}
        />
      </div>

      {(restartRequested || !session || (session.completedSteps < 3 && !session.probingQuestion)) && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 text-sm font-semibold text-amber-800">🧠 3분 브레인덤프</p>
            <p className="text-xs leading-relaxed text-amber-700">
              지금 떠오르는 생각을 검열하지 말고 적어보세요. 한국어든 일본어든 상관없고, 문장이 매끄럽지 않아도 괜찮습니다.
            </p>
          </div>

          {!timerStarted ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-center text-sm text-slate-600">준비가 되면 타이머를 시작하세요.</p>
              <Button onClick={handleStartTimer} size="lg">
                타이머 시작하기 (3분)
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <CountdownTimer seconds={180} onDone={() => setTimerDone(true)} />
              </div>
              <Textarea
                placeholder="지금 떠오르는 생각을 멈추지 말고 적어보세요…"
                value={rawThoughts}
                onChange={(e) => setRawThoughts(e.target.value)}
                rows={7}
                charCount={rawThoughts.length}
                maxChars={2000}
                autoFocus
              />
              {error ? <ErrorMessage error={error} /> : null}
              <Button
                onClick={handleBrainstormSubmit}
                isLoading={brainstorm.isPending}
                disabled={rawThoughts.trim().length < 10}
                className="w-full"
              >
                {timerDone ? '생각 정리 완료, 질문 받기' : '중간이라도 보내기'}
              </Button>
            </div>
          )}
        </div>
      )}

      {session?.probingQuestion && session.completedSteps < 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-brand-400">AI Question</p>
            <p className="text-base font-semibold leading-relaxed text-brand-800">
              💬 {session.probingQuestion}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600">이 질문에 답하면서 기록의 의미를 한 번 더 생각해보세요.</p>
            <Textarea
              placeholder="지금 느끼는 감정과 새로 떠오른 생각을 적어보세요…"
              value={probingAnswer}
              onChange={(e) => setProbingAnswer(e.target.value)}
              rows={5}
              charCount={probingAnswer.length}
              maxChars={1000}
              autoFocus
            />
            {error ? <ErrorMessage error={error} /> : null}
            <Button
              onClick={handleProbeSubmit}
              isLoading={probe.isPending}
              disabled={probingAnswer.trim().length < 5}
              className="w-full"
            >
              인사이트 생성하기
            </Button>
          </div>
        </div>
      )}

      {isDone && session && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-500">
                Insight Score
              </p>
              <p className="text-xs text-slate-500">
                구체성, 감정의 깊이, 자기 이해를 종합한 점수입니다.
              </p>
            </div>
            <ScoreRing score={session.verbalizationScore ?? 0} />
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-brand-400">
              AI Insight · Japanese
            </p>
            <p className="text-base font-semibold leading-relaxed text-slate-800">
              {session.aiInsightJa}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Summary · Korean
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {session.aiInsightKo}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-lg">🐕</span>
            <p className="text-xs font-medium text-emerald-700">
              언어화가 완료되었습니다. 이 결과는 성장 지표와 이후 인사이트 흐름에도 반영됩니다.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              setRawThoughts('')
              setProbingAnswer('')
              setError(null)
              setRestartRequested(true)
              setTimerStarted(false)
              setTimerDone(false)
              setStartMs(null)
            }}
          >
            처음부터 다시 하기
          </Button>
        </div>
      )}
    </div>
  )
}
