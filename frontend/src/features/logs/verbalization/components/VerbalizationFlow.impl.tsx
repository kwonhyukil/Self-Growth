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

// ── Step indicator ────────────────────────────────────────────

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={clsx('flex items-center gap-2', !active && !done && 'opacity-40')}>
      <div className={clsx(
        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
        done  ? 'bg-emerald-500 text-white' :
        active ? 'bg-brand-600 text-white shadow-sm' :
                 'bg-slate-200 text-slate-500'
      )}>
        {done ? '✓' : n}
      </div>
      <span className={clsx('text-xs font-semibold', active ? 'text-slate-800' : 'text-slate-400')}>
        {label}
      </span>
    </div>
  )
}

// ── Countdown timer ───────────────────────────────────────────

function CountdownTimer({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const doneRef = useRef(false)

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          if (!doneRef.current) { doneRef.current = true; onDone?.() }
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
            cx="18" cy="18" r="15.9" fill="none"
            stroke={remaining === 0 ? '#10b981' : '#0284c7'}
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={100 - pct}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700 tabular-nums">
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      {remaining === 0 && (
        <span className="text-xs font-semibold text-emerald-600">時間になりました！</span>
      )}
    </div>
  )
}

// ── Score ring ────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? '素晴らしい！' : score >= 40 ? 'まあまあ' : 'もう少し'
  const pct = score

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg className="rotate-[-90deg]" viewBox="0 0 36 36" width={96} height={96}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3.5"
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
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

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

  // Resume state from existing session
  useEffect(() => {
    if (session) {
      if (session.rawThoughts) setRawThoughts(session.rawThoughts)
      if (session.probingAnswer) setProbingAnswer(session.probingAnswer)
    }
  }, [session?.id]) // eslint-disable-line

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <Spinner size="md" />
    </div>
  )

  // Derive current step from session
  const step = !session ? 2 : session.completedSteps >= 3 ? 3 : session.probingQuestion ? 2 : 2

  // If fully done, show result
  const isDone = session?.completedSteps === 3

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
      {/* Step indicator */}
      <div className="flex items-center gap-4">
        <StepBadge n={1} label="記録" active={false} done={true} />
        <div className="h-px flex-1 bg-slate-200" />
        <StepBadge n={2} label="ブレインストーム" active={!isDone && (!session || !session.aiInsightJa)} done={isDone || !!session?.aiInsightJa} />
        <div className="h-px flex-1 bg-slate-200" />
        <StepBadge n={3} label="インサイト" active={!isDone && !!session?.probingQuestion} done={isDone} />
      </div>

      {/* ── Step 2: Brainstorm ── */}
      {(!session || (session.completedSteps < 3 && !session.probingQuestion)) && (
        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm font-semibold text-amber-800 mb-1">🧠 3分ブレインダンプ</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              今感じていること、頭の中にあること、すべてを日本語でも韓国語でも構わず吐き出してください。
              文法もスタイルも気にしない。タイマーが鳴るまで書き続けましょう。
            </p>
          </div>

          {!timerStarted ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-slate-600 text-center">準備ができたらタイマーをスタートしてください</p>
              <Button onClick={handleStartTimer} size="lg">
                ▶ タイマーをスタート（3分）
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <CountdownTimer seconds={180} onDone={() => setTimerDone(true)} />
              </div>
              <Textarea
                placeholder="今、頭の中にあることをすべて書き出してください…"
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
                {timerDone ? '✓ 書き終えた！AIに問いを作ってもらう' : '途中でも送信する →'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2→3: Show probing question + answer ── */}
      {session?.probingQuestion && session.completedSteps < 3 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-brand-50 border border-brand-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">AIからの探索質問</p>
            <p className="text-base font-semibold text-brand-800 leading-relaxed">
              💬 {session.probingQuestion}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600">この質問への答えを、感じたままに書いてください。</p>
            <Textarea
              placeholder="感じたこと、気づいたことを率直に…"
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
              ✨ インサイトを生成する
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Result ── */}
      {isDone && session && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">
                言語化スコア
              </p>
              <p className="text-xs text-slate-500">
                具体性・感情の深さ・自己理解の総合評価
              </p>
            </div>
            <ScoreRing score={session.verbalizationScore ?? 0} />
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400 mb-2">
              AI生成 — 日本語インサイト
            </p>
            <p className="text-base font-semibold text-slate-800 leading-relaxed">
              {session.aiInsightJa}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              요약 (한국어)
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {session.aiInsightKo}
            </p>
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
            <span className="text-lg">🐕</span>
            <p className="text-xs text-emerald-700 font-medium">
              言語化が完了しました！レーダーチャートの「言語化の解像度」軸が更新されます。
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              setRawThoughts('')
              setProbingAnswer('')
              setTimerStarted(false)
              setTimerDone(false)
              setStartMs(null)
            }}
          >
            もう一度やり直す
          </Button>
        </div>
      )}
    </div>
  )
}
