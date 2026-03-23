import { useCallback, useEffect, useState, Fragment } from 'react'
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
  initialStep?: 1 | 2 | 3 | 4
  autoDraftJa?: boolean
  onDraftApplied?: () => void
}

function CharCount({ current, max }: { current: number; max: number }) {
  const near = current >= max * 0.85
  const over = current > max

  return (
    <span
      className={clsx(
        'text-[10px] tabular-nums transition-colors',
        over ? 'font-semibold text-error-500' : near ? 'text-warning-500' : 'text-text-disabled',
      )}
    >
      {current}/{max}
    </span>
  )
}

const STEP_LABELS = ['気分', 'きっかけ', '振り返り', '確認']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6 flex items-center" aria-label={`記録ステップ ${current}/4`}>
      {[1, 2, 3, 4].map((n, i) => (
        <Fragment key={n}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={clsx(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all',
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
                'whitespace-nowrap text-[10px] font-medium',
                current === n ? 'text-primary-600' : 'text-text-disabled',
              )}
            >
              {STEP_LABELS[i]}
            </span>
          </div>
          {i < 3 && (
            <div
              className={clsx(
                'mx-1 mb-4 h-0.5 flex-1 transition-colors duration-300',
                current > n ? 'bg-primary-400' : 'bg-border-subtle',
              )}
            />
          )}
        </Fragment>
      ))}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null

  return (
    <div className="flex gap-3 border-b border-border-subtle py-2.5 last:border-0">
      <span className="w-24 shrink-0 pt-0.5 text-xs font-medium text-text-disabled">{label}</span>
      <span className="flex-1 text-sm leading-relaxed text-text-main">{value}</span>
    </div>
  )
}

export function LogForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = '保存する',
  savedLogId,
  initialStep = 1,
  autoDraftJa = false,
  onDraftApplied,
}: LogFormProps) {
  const [happenedAt, setHappenedAt] = useState(
    initial?.happenedAt ? initial.happenedAt.slice(0, 16) : fmt.isoNow().slice(0, 16),
  )
  const [moodTag, setMoodTag] = useState<MoodTag | undefined>(initial?.moodTag ?? undefined)
  const [moodIntensity, setMoodIntensity] = useState<number>(initial?.moodIntensity ?? 3)
  const [triggerKo, setTriggerKo] = useState(initial?.triggerKo ?? '')
  const [specificEvent, setSpecificEvent] = useState(initial?.specificEvent ?? '')
  const [praiseKo, setPraiseKo] = useState(initial?.praiseKo ?? '')
  const [praiseJa, setPraiseJa] = useState(initial?.praiseJa ?? '')

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [draftSuccess, setDraftSuccess] = useState(false)
  const [autoDraftDone, setAutoDraftDone] = useState(false)

  const jaLen = praiseJa.length
  const jaInvalid = jaLen > 0 && (jaLen < JA_MIN_LEN || jaLen > JA_MAX_LEN)
  const canSubmit = !!moodTag && triggerKo.trim().length > 0 && praiseKo.trim().length > 0 && !jaInvalid

  const stepValid =
    step === 1 ? !!moodTag :
    step === 2 ? triggerKo.trim().length > 0 :
    step === 3 ? praiseKo.trim().length > 0 && !jaInvalid :
    true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !moodTag) return

    setError(null)
    setLoading(true)

    try {
      await onSubmit({
        happenedAt: new Date(happenedAt).toISOString(),
        moodTag,
        moodIntensity,
        triggerKo: triggerKo.trim(),
        specificEvent: specificEvent.trim() || undefined,
        praiseKo: praiseKo.trim(),
        praiseJa: praiseJa.trim() || undefined,
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDraftJa = useCallback(async () => {
    if (!savedLogId) return

    setError(null)
    setDrafting(true)
    setDraftSuccess(false)

    try {
      const draft = await logsApi.draftJa(savedLogId)
      setPraiseJa(draft)
      setDraftSuccess(true)
      onDraftApplied?.()
      setTimeout(() => setDraftSuccess(false), 3000)
    } catch (err) {
      setError(err)
    } finally {
      setDrafting(false)
    }
  }, [onDraftApplied, savedLogId])

  useEffect(() => {
    if (!autoDraftJa || autoDraftDone || !savedLogId) return
    if (!praiseKo.trim() || praiseJa.trim()) return

    setAutoDraftDone(true)
    void handleDraftJa()
  }, [autoDraftJa, autoDraftDone, handleDraftJa, praiseKo, praiseJa, savedLogId])

  const goNext = () => setStep((current) => (current < 4 ? ((current + 1) as 1 | 2 | 3 | 4) : current))
  const goPrev = () => setStep((current) => (current > 1 ? ((current - 1) as 1 | 2 | 3 | 4) : current))

  return (
    <form onSubmit={handleSubmit}>
      <StepIndicator current={step} />

      <div className="space-y-6 animate-fade-in" key={step}>
        {step === 1 && (
          <>
            <p className="mb-4 -mt-2 text-center text-sm text-text-soft">
              まずは、今日の記録にいちばん近い気分を選びましょう。
            </p>
            <Input
              label="記録した時間"
              type="datetime-local"
              value={happenedAt}
              onChange={(e) => setHappenedAt(e.target.value)}
              required
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-text-sub">今の気分</p>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_TAGS.map((m: MoodTag) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoodTag(m)}
                    aria-pressed={moodTag === m}
                    aria-label={`${MOOD_LABELS[m]} を選択`}
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
              {moodTag && (
                <p className="mt-1.5 animate-fade-in text-center text-xs text-primary-600">
                  {MOOD_FEEDBACK[moodTag]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label id="mood-intensity-label" className="text-sm font-semibold text-text-sub">
                  気持ちの強さ
                  <span className="ml-1.5 text-xs font-normal text-text-disabled">1〜5で選択</span>
                </label>
                <span className="text-sm tracking-wider" aria-label={`気持ちの強さ ${moodIntensity}/5`}>
                  {'★'.repeat(moodIntensity)}
                  <span className="text-border">{'☆'.repeat(5 - moodIntensity)}</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={moodIntensity}
                onChange={(e) => setMoodIntensity(Number(e.target.value))}
                aria-labelledby="mood-intensity-label"
                className="h-1.5 w-full cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-[10px] text-text-disabled">
                <span>穏やか</span>
                <span>強い</span>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mb-4 -mt-2 text-center text-sm text-text-soft">
              今日の気持ちにつながった出来事を、そのまま書き出してください。
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-sub">
                  きっかけになった出来事
                  <span className="ml-1.5 text-xs font-normal text-error-500">必須</span>
                </label>
                <CharCount current={triggerKo.length} max={200} />
              </div>
              <Textarea
                placeholder="どんな出来事が心に残りましたか？短くても大丈夫です。"
                value={triggerKo}
                onChange={(e) => setTriggerKo(e.target.value)}
                rows={3}
                maxChars={200}
                charCount={triggerKo.length}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-sub">
                  もう少し詳しく
                  <span className="ml-1.5 text-xs font-normal text-text-disabled">
                    相手・場所・会話など、必要なら補足してください
                  </span>
                </label>
                {specificEvent.length > 0 && <CharCount current={specificEvent.length} max={500} />}
              </div>
              <Textarea
                placeholder="あとで自分で読み返したときに思い出しやすい情報があれば書いておきましょう。"
                value={specificEvent}
                onChange={(e) => setSpecificEvent(e.target.value)}
                rows={3}
                maxChars={500}
                charCount={specificEvent.length}
              />
              {!specificEvent && (
                <p className="flex items-center gap-1 text-[11px] text-text-disabled">
                  <span>💡</span>
                  任意入力です。ここは空欄でも先に進めます。
                </p>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="mb-4 -mt-2 text-center text-sm text-text-soft">
              自分にかけたいひと言をまとめてから、日本語の振り返りにつなげます。
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-sub">自分にかけたいひと言（韓国語）</span>
                <span className="text-xs text-error-500">必須</span>
              </div>
              <Textarea
                placeholder="たとえば: 緊張していても最後まで話し切れた自分を認めたい。"
                value={praiseKo}
                onChange={(e) => setPraiseKo(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-sub">
                  日本語での振り返り
                  <span className="ml-1.5 text-xs font-normal text-text-disabled">
                    保存後はAIの下書きを使って整えられます
                  </span>
                </label>

                {savedLogId && (
                  <button
                    type="button"
                    onClick={handleDraftJa}
                    disabled={drafting || !praiseKo.trim()}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-all',
                      draftSuccess
                        ? 'border-success-300 bg-success-50 text-success-700'
                        : 'border-primary-200 bg-primary-50 text-primary-600 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40',
                    )}
                  >
                    {drafting ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
                        生成中...
                      </>
                    ) : draftSuccess ? (
                      <>下書きを反映しました</>
                    ) : (
                      <>AIで下書き</>
                    )}
                  </button>
                )}
              </div>

              <div className="relative">
                <Textarea
                  placeholder="日本語で書けるところまで書いてください。あとからAI下書きやフィードバックで整えられます。"
                  value={praiseJa}
                  onChange={(e) => setPraiseJa(e.target.value)}
                  rows={3}
                  error={
                    jaInvalid
                      ? `${JA_MIN_LEN}〜${JA_MAX_LEN}文字にしてください（現在 ${jaLen} 文字）`
                      : undefined
                  }
                />
                {jaLen > 0 && (
                  <div className="absolute bottom-2.5 right-3">
                    <CharCount current={jaLen} max={JA_MAX_LEN} />
                  </div>
                )}
              </div>

              {!praiseJa && (
                <p className="flex items-center gap-1 text-[11px] text-text-disabled">
                  <span>💡</span>
                  いまは空欄でも大丈夫です。保存後、この画面で日本語の下書きを自動生成できます。
                </p>
              )}
            </div>
          </>
        )}

        {step === 4 && (
          <div>
            <p className="mb-4 -mt-2 text-center text-sm text-text-soft">
              保存前に内容を確認しましょう。あとから編集もできます。
            </p>
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
              <ReviewRow label="日時" value={happenedAt.replace('T', ' ')} />
              <ReviewRow
                label="気分"
                value={moodTag ? `${MOOD_EMOJI[moodTag]} ${MOOD_LABELS[moodTag]}` : undefined}
              />
              <ReviewRow label="強さ" value={'★'.repeat(moodIntensity) + '☆'.repeat(5 - moodIntensity)} />
              <ReviewRow label="きっかけ" value={triggerKo} />
              {specificEvent && <ReviewRow label="補足" value={specificEvent} />}
              <ReviewRow label="韓国語" value={praiseKo} />
              {praiseJa && <ReviewRow label="日本語" value={praiseJa} />}
            </div>
            {error !== null && <ErrorMessage error={error} className="mt-4" />}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex items-center justify-between gap-3 border-t border-border-subtle bg-surface-elevated px-6 py-4">
        {step > 1 ? (
          <Button type="button" variant="ghost" onClick={goPrev}>
            戻る
          </Button>
        ) : (
          onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              閉じる
            </Button>
          )
        )}

        <div className="ml-auto">
          {step < 4 ? (
            <Button type="button" onClick={goNext} disabled={!stepValid}>
              次へ
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
