import { useState, Fragment } from 'react'
import type { CreateLogBody, GrowthLog, MoodTag } from '@/types'
import { MOOD_TAGS } from '@/types'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_FEEDBACK, JA_MIN_LEN, JA_MAX_LEN } from '@/shared/lib/constants'
import { fmt } from '@/shared/lib/formatters'
import { logsApi } from '@/features/logs/api'
import { Button } from '@/shared/ui/Button'
import { Input, Textarea } from '@/shared/ui/Input'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { clsx } from 'clsx'

interface LogFormProps {
  initial?: Partial<GrowthLog>
  onSubmit: (body: CreateLogBody) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  savedLogId?: number
}

// ── 문자 수 뱃지 ────────────────────────────────────────────────
function CharCount({ current, max }: { current: number; max: number }) {
  const near = current >= max * 0.85
  const over = current > max
  return (
    <span className={clsx(
      'text-[10px] tabular-nums transition-colors',
      over  ? 'text-error-500 font-semibold' :
      near  ? 'text-warning-500'            : 'text-text-disabled'
    )}>
      {current}/{max}
    </span>
  )
}

// ── 스텝 인디케이터 ─────────────────────────────────────────────
const STEP_LABELS = ['感情', 'できごと', '自己称賛', '確認']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-6">
      {[1, 2, 3, 4].map((n, i) => (
        <Fragment key={n}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
                current > n
                  ? 'bg-primary-400 text-white'
                  : current === n
                  ? 'bg-primary-600 text-white ring-2 ring-primary-200 ring-offset-1'
                  : 'bg-surface-muted text-text-disabled',
              )}
            >
              {current > n ? '✓' : n}
            </div>
            <span
              className={clsx(
                'text-[10px] font-medium whitespace-nowrap',
                current === n ? 'text-primary-600' : 'text-text-disabled',
              )}
            >
              {STEP_LABELS[i]}
            </span>
          </div>
          {i < 3 && (
            <div
              className={clsx(
                'flex-1 h-0.5 mx-1 mb-4 transition-colors duration-300',
                current > n ? 'bg-primary-400' : 'bg-border-subtle',
              )}
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}

// ── 확인 화면 행 ────────────────────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-2.5 border-b border-border-subtle last:border-0">
      <span className="text-xs font-medium text-text-disabled shrink-0 w-24 pt-0.5">{label}</span>
      <span className="text-sm text-text-main flex-1 leading-relaxed">{value}</span>
    </div>
  )
}

export function LogForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = '保存する',
  savedLogId,
}: LogFormProps) {
  // ── 폼 상태 ─────────────────────────────────────────────────
  const [happenedAt,    setHappenedAt]    = useState(initial?.happenedAt ? initial.happenedAt.slice(0, 16) : fmt.isoNow().slice(0, 16))
  const [moodTag,       setMoodTag]       = useState<MoodTag | undefined>(initial?.moodTag ?? undefined)
  const [moodIntensity, setMoodIntensity] = useState<number>(initial?.moodIntensity ?? 3)
  const [triggerKo,     setTriggerKo]     = useState(initial?.triggerKo ?? '')
  const [specificEvent, setSpecificEvent] = useState(initial?.specificEvent ?? '')
  const [praiseKo,      setPraiseKo]      = useState(initial?.praiseKo ?? '')
  const [praiseJa,      setPraiseJa]      = useState(initial?.praiseJa ?? '')

  const [step,         setStep]         = useState<1|2|3|4>(1)
  const [error,        setError]        = useState<unknown>(null)
  const [loading,      setLoading]      = useState(false)
  const [drafting,     setDrafting]     = useState(false)
  const [draftSuccess, setDraftSuccess] = useState(false)

  // ── 유효성 ──────────────────────────────────────────────────
  const jaLen     = praiseJa.length
  const jaInvalid = jaLen > 0 && (jaLen < JA_MIN_LEN || jaLen > JA_MAX_LEN)
  const canSubmit = !!moodTag && triggerKo.trim().length > 0 && praiseKo.trim().length > 0 && !jaInvalid

  const stepValid =
    step === 1 ? !!moodTag :
    step === 2 ? triggerKo.trim().length > 0 :
    step === 3 ? praiseKo.trim().length > 0 && !jaInvalid :
    true

  // ── 핸들러 ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !moodTag) return
    setError(null)
    setLoading(true)
    try {
      await onSubmit({
        happenedAt:    new Date(happenedAt).toISOString(),
        moodTag,
        moodIntensity,
        triggerKo:     triggerKo.trim(),
        specificEvent: specificEvent.trim() || undefined,
        praiseKo:      praiseKo.trim(),
        praiseJa:      praiseJa.trim() || undefined,
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDraftJa = async () => {
    if (!savedLogId) return
    setDrafting(true)
    setDraftSuccess(false)
    try {
      const draft = await logsApi.draftJa(savedLogId)
      setPraiseJa(draft)
      setDraftSuccess(true)
      setTimeout(() => setDraftSuccess(false), 3000)
    } catch (err) {
      setError(err)
    } finally {
      setDrafting(false)
    }
  }

  const goNext = () => setStep((s) => (s < 4 ? ((s + 1) as 1|2|3|4) : s))
  const goPrev = () => setStep((s) => (s > 1 ? ((s - 1) as 1|2|3|4) : s))

  return (
    <form onSubmit={handleSubmit}>
      {/* ── 스텝 인디케이터 ── */}
      <StepIndicator current={step} />

      {/* ── 스텝 콘텐츠 ── */}
      <div className="space-y-6 animate-fade-in" key={step}>

        {/* STEP 1: 감정 선택 */}
        {step === 1 && (
          <>
            <p className="text-sm text-text-soft text-center -mt-2 mb-4">
              今の気持ちに近いものを選んでください
            </p>
            <Input
              label="いつのこと？"
              type="datetime-local"
              value={happenedAt}
              onChange={(e) => setHappenedAt(e.target.value)}
              required
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-sub">気分は？</p>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_TAGS.map((m: MoodTag) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoodTag(m)}
                    className={clsx(
                      'flex flex-col items-center gap-0.5 rounded-xl border p-2.5 text-xs font-medium transition-all duration-150',
                      moodTag === m
                        ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-sm ring-2 ring-primary-200'
                        : 'border-border bg-surface-elevated text-text-soft hover:border-border-strong hover:bg-surface-subtle',
                    )}
                  >
                    <span className="text-xl">{MOOD_EMOJI[m]}</span>
                    <span>{MOOD_LABELS[m]}</span>
                  </button>
                ))}
              </div>
              {/* 감정 피드백 문구 */}
              {moodTag && (
                <p className="text-xs text-primary-600 animate-fade-in mt-1.5 text-center">
                  {MOOD_FEEDBACK[moodTag]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-sub">
                  感情の強さ
                  <span className="ml-1.5 text-xs font-normal text-text-disabled">どのくらい強く感じましたか？</span>
                </label>
                <span className="text-sm tracking-wider" aria-label={`${moodIntensity}段階`}>
                  {'★'.repeat(moodIntensity)}
                  <span className="text-border">{'★'.repeat(5 - moodIntensity)}</span>
                </span>
              </div>
              <input
                type="range"
                min={1} max={5} step={1}
                value={moodIntensity}
                onChange={(e) => setMoodIntensity(Number(e.target.value))}
                className="w-full h-1.5 accent-primary-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-disabled">
                <span>穏やか</span>
                <span>強烈</span>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: 상황 정리 */}
        {step === 2 && (
          <>
            <p className="text-sm text-text-soft text-center -mt-2 mb-4">
              どんなことがあったのかを簡単に書いてみましょう
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-sub">
                  きっかけ・状況
                  <span className="ml-1.5 text-xs font-normal text-error-500">必須</span>
                </label>
                <CharCount current={triggerKo.length} max={200} />
              </div>
              <Textarea
                placeholder="今日、発表でうまく話せた。先生に褒めてもらった…"
                value={triggerKo}
                onChange={(e) => setTriggerKo(e.target.value)}
                rows={3}
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-sub">
                  具体的なできごと
                  <span className="ml-1.5 text-xs font-normal text-text-disabled">
                    任意 — AIがより深く分析できます
                  </span>
                </label>
                {specificEvent.length > 0 && <CharCount current={specificEvent.length} max={500} />}
              </div>
              <Textarea
                placeholder="発表の直前、声が震えた。でも最初の一言を言えたら落ち着いた。"
                value={specificEvent}
                onChange={(e) => setSpecificEvent(e.target.value)}
                rows={3}
                maxLength={500}
              />
              {!specificEvent && (
                <p className="text-[11px] text-text-disabled flex items-center gap-1">
                  <span>💡</span>
                  入力すると言語化プロセスの精度が上がります
                </p>
              )}
            </div>
          </>
        )}

        {/* STEP 3: 자기 칭찬 */}
        {step === 3 && (
          <>
            <p className="text-sm text-text-soft text-center -mt-2 mb-4">
              今日の自分を優しく褒めてみましょう
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-sub">自己称賛（母語）</span>
                <span className="text-xs text-error-500">必須</span>
              </div>
              <Textarea
                placeholder="나는 오늘 발표를 잘 해냈어. 긴장했지만 끝까지 했다！"
                value={praiseKo}
                onChange={(e) => setPraiseKo(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-sub">
                  自己称賛（日本語）
                  <span className="ml-1.5 text-xs font-normal text-text-disabled">任意 — AIが下書きを作れます</span>
                </label>

                {savedLogId && (
                  <button
                    type="button"
                    onClick={handleDraftJa}
                    disabled={drafting || !praiseKo.trim()}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all border',
                      draftSuccess
                        ? 'border-success-300 bg-success-50 text-success-700'
                        : 'border-primary-200 bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                  >
                    {drafting ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
                        生成中…
                      </>
                    ) : draftSuccess ? (
                      <>✓ 下書き完了</>
                    ) : (
                      <>✨ AI下書き</>
                    )}
                  </button>
                )}
              </div>

              <div className="relative">
                <Textarea
                  placeholder="今日の発表、緊張したけど最後まで頑張った！（任意）"
                  value={praiseJa}
                  onChange={(e) => setPraiseJa(e.target.value)}
                  rows={3}
                  error={jaInvalid ? `${JA_MIN_LEN}〜${JA_MAX_LEN}文字にしてください（現在 ${jaLen} 文字）` : undefined}
                />
                {jaLen > 0 && (
                  <div className="absolute bottom-2.5 right-3">
                    <CharCount current={jaLen} max={JA_MAX_LEN} />
                  </div>
                )}
              </div>

              {!praiseJa && (
                <p className="text-[11px] text-text-disabled flex items-center gap-1">
                  <span>💡</span>
                  日本語を入力するとAIフィードバックが使えます。後で追加もOK！
                </p>
              )}
            </div>
          </>
        )}

        {/* STEP 4: 확인 & 저장 */}
        {step === 4 && (
          <div>
            <p className="text-sm text-text-soft text-center -mt-2 mb-4">内容を確認して保存します</p>
            <div className="rounded-xl bg-surface-subtle border border-border-subtle p-4">
              <ReviewRow label="日時" value={happenedAt.replace('T', ' ')} />
              <ReviewRow
                label="気分"
                value={moodTag ? `${MOOD_EMOJI[moodTag]} ${MOOD_LABELS[moodTag]}` : undefined}
              />
              <ReviewRow label="感情の強さ" value={'★'.repeat(moodIntensity) + '☆'.repeat(5 - moodIntensity)} />
              <ReviewRow label="きっかけ" value={triggerKo} />
              {specificEvent && <ReviewRow label="できごと" value={specificEvent} />}
              <ReviewRow label="称賛（母語）" value={praiseKo} />
              {praiseJa && <ReviewRow label="称賛（日本語）" value={praiseJa} />}
            </div>
            {error !== null && <ErrorMessage error={error} className="mt-4" />}
          </div>
        )}
      </div>

      {/* ── sticky 하단 네비게이션 ── */}
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-elevated px-6 py-4">
        {step > 1 ? (
          <Button type="button" variant="ghost" onClick={goPrev}>
            戻る
          </Button>
        ) : (
          onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              キャンセル
            </Button>
          )
        )}

        <div className="ml-auto">
          {step < 4 ? (
            <Button type="button" onClick={goNext} disabled={!stepValid}>
              次へ →
            </Button>
          ) : (
            <Button type="submit" isLoading={loading} disabled={!canSubmit}>
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
