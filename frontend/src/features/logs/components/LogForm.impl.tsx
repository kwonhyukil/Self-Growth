import { useCallback, useEffect, useState } from 'react'
import type { CreateLogBody, GrowthLog, MoodTag } from '@/types'
import { JA_MAX_LEN, JA_MIN_LEN } from '@/shared/lib/constants'
import { fmt } from '@/shared/lib/formatters'
import { logsApi } from '@/features/logs/api'
import {
  LogFormFooter,
  LogFormStepEvent,
  LogFormStepIndicator,
  LogFormStepMood,
  LogFormStepReflection,
  LogFormStepReview,
} from '@/features/logs/components/LogFormSections'

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
      <LogFormStepIndicator current={step} />

      <div className="space-y-6 animate-fade-in" key={step}>
        {step === 1 && (
          <LogFormStepMood
            happenedAt={happenedAt}
            moodTag={moodTag}
            moodIntensity={moodIntensity}
            onHappenedAtChange={setHappenedAt}
            onMoodTagChange={setMoodTag}
            onMoodIntensityChange={setMoodIntensity}
          />
        )}

        {step === 2 && (
          <LogFormStepEvent
            triggerKo={triggerKo}
            specificEvent={specificEvent}
            onTriggerKoChange={setTriggerKo}
            onSpecificEventChange={setSpecificEvent}
          />
        )}

        {step === 3 && (
          <LogFormStepReflection
            praiseKo={praiseKo}
            praiseJa={praiseJa}
            savedLogId={savedLogId}
            drafting={drafting}
            draftSuccess={draftSuccess}
            onPraiseKoChange={setPraiseKo}
            onPraiseJaChange={setPraiseJa}
            onDraftJa={() => void handleDraftJa()}
          />
        )}

        {step === 4 && (
          <LogFormStepReview
            happenedAt={happenedAt}
            moodTag={moodTag}
            moodIntensity={moodIntensity}
            triggerKo={triggerKo}
            specificEvent={specificEvent}
            praiseKo={praiseKo}
            praiseJa={praiseJa}
            error={error}
          />
        )}
      </div>

      <LogFormFooter
        step={step}
        stepValid={stepValid}
        canSubmit={canSubmit}
        loading={loading}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onPrev={goPrev}
        onNext={goNext}
      />
    </form>
  )
}
