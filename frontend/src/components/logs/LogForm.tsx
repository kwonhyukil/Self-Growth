import { useState } from 'react'
import type { CreateLogBody, GrowthLog, MoodTag } from '../../types'
import { MOOD_TAGS } from '../../types'
import { MOOD_EMOJI, MOOD_LABELS, JA_MIN_LEN, JA_MAX_LEN } from '../../utils/constants'
import { fmt } from '../../utils/formatters'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { ErrorMessage } from '../ui/ErrorMessage'
import { clsx } from 'clsx'

interface LogFormProps {
  initial?: Partial<GrowthLog>
  onSubmit: (body: CreateLogBody) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function LogForm({ initial, onSubmit, onCancel, submitLabel = '保存する' }: LogFormProps) {
  const [happenedAt, setHappenedAt] = useState(
    initial?.happenedAt ? initial.happenedAt.slice(0, 16) : fmt.isoNow().slice(0, 16),
  )
  const [moodTag, setMoodTag] = useState<MoodTag>(initial?.moodTag ?? 'CALM')
  const [triggerKo, setTriggerKo] = useState(initial?.triggerKo ?? '')
  const [praiseKo, setPraiseKo] = useState(initial?.praiseKo ?? '')
  const [praiseJa, setPraiseJa] = useState(initial?.praiseJa ?? '')
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  const jaLen = praiseJa.length
  const jaInvalid = jaLen > 0 && (jaLen < JA_MIN_LEN || jaLen > JA_MAX_LEN)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!moodTag || !triggerKo.trim() || !praiseKo.trim() || !praiseJa.trim()) return
    if (jaLen < JA_MIN_LEN || jaLen > JA_MAX_LEN) return

    setError(null)
    setLoading(true)
    try {
      await onSubmit({
        happenedAt: new Date(happenedAt).toISOString(),
        moodTag,
        triggerKo: triggerKo.trim(),
        praiseKo: praiseKo.trim(),
        praiseJa: praiseJa.trim(),
      })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <Input
        label="いつのこと？"
        type="datetime-local"
        value={happenedAt}
        onChange={(e) => setHappenedAt(e.target.value)}
        required
      />

      {/* Mood picker */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-700">気分は？</p>
        <div className="grid grid-cols-5 gap-2">
          {MOOD_TAGS.map((m: MoodTag) => (
            <button
              key={m}
              type="button"
              onClick={() => setMoodTag(m)}
              className={clsx(
                'flex flex-col items-center gap-0.5 rounded-xl border p-2.5 text-xs font-medium transition-all',
                moodTag === m
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <span className="text-xl">{MOOD_EMOJI[m]}</span>
              <span>{MOOD_LABELS[m]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trigger */}
      <Textarea
        label="きっかけ・状況（韓国語 or 日本語）"
        placeholder="今日、発表でうまく話せた。先生に褒めてもらった…"
        value={triggerKo}
        onChange={(e) => setTriggerKo(e.target.value)}
        rows={2}
        maxLength={200}
        charCount={triggerKo.length}
        maxChars={200}
        required
      />

      {/* Self-praise Korean */}
      <Textarea
        label="自己称賛（ネイティブ言語）"
        placeholder="나는 오늘 발표를 잘 해냈어. 긴장했지만 끝까지 했다!"
        value={praiseKo}
        onChange={(e) => setPraiseKo(e.target.value)}
        rows={3}
        required
      />

      {/* Self-praise Japanese */}
      <Textarea
        label="自己称賛（日本語）"
        placeholder="今日の発表、緊張したけど最後まで頑張った！"
        value={praiseJa}
        onChange={(e) => setPraiseJa(e.target.value)}
        rows={3}
        charCount={jaLen}
        maxChars={JA_MAX_LEN}
        hint={`${JA_MIN_LEN}〜${JA_MAX_LEN}文字で入力してください`}
        error={jaInvalid ? `${JA_MIN_LEN}〜${JA_MAX_LEN}文字にしてください（現在 ${jaLen} 文字）` : undefined}
        required
      />

      {error !== null && <ErrorMessage error={error} />}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            キャンセル
          </Button>
        )}
        <Button
          type="submit"
          isLoading={loading}
          disabled={jaInvalid}
          className="flex-1"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
