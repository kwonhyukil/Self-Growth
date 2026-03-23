import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLog, useDeleteLog, useUpdateLog } from '@/features/logs/queries'
import { JaCheckPanel } from '@/features/logs/ja-check/components/JaCheckPanel'
import { LogForm } from '@/features/logs/components/LogForm'
import { VerbalizationFlow } from '@/features/logs/verbalization/components/VerbalizationFlow'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { Badge } from '@/shared/ui/Badge'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLOR } from '@/shared/lib/constants'
import { fmt } from '@/shared/lib/formatters'
import type { CreateLogBody } from '@/types'

type Tab = 'feedback' | 'verbalize' | 'edit'

function parseTab(value: string | null): Tab | null {
  if (value === 'feedback' || value === 'verbalize' || value === 'edit') return value
  return null
}

function StageCard({
  eyebrow,
  title,
  description,
  active,
}: {
  eyebrow: string
  title: string
  description: string
  active: boolean
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 transition-colors ${
        active
          ? 'border-primary-200 bg-primary-50/80'
          : 'border-white/60 bg-white/45'
      }`}
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
        {eyebrow}
      </p>
      <p className="text-sm font-semibold text-text-main">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-text-sub">{description}</p>
    </div>
  )
}

export function LogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const logId = Number(id)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: log, isLoading, error } = useLog(logId)
  const deleteLog = useDeleteLog()
  const updateLog = useUpdateLog(logId)

  const [tab, setTab] = useState<Tab>('feedback')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const requestedTab = parseTab(searchParams.get('tab'))
  const createdFromList = searchParams.get('created') === '1'
  const autoDraftJa = searchParams.get('draftJa') === '1'
  const hasJa = Boolean(log?.praiseJa?.trim())

  useEffect(() => {
    if (!log) return

    const nextTab =
      requestedTab === 'edit'
        ? 'edit'
        : requestedTab === 'verbalize'
          ? 'verbalize'
          : requestedTab === 'feedback'
            ? (hasJa ? 'feedback' : 'edit')
            : (hasJa ? 'feedback' : 'edit')

    setTab(nextTab)
  }, [requestedTab, hasJa, log])

  const notice = useMemo(() => {
    if (createdFromList) {
      return hasJa
        ? {
            tone: 'success',
            title: '로그를 저장했습니다',
            body: '기록은 저장되었고 일본어 문장도 들어 있습니다. 이제 Feedback Agent로 점검하거나 Insight Agent로 더 깊게 정리할 수 있습니다.',
          }
        : {
            tone: 'info',
            title: '로그를 저장했습니다',
            body: '다음 단계는 일본어 문장을 정리하는 것입니다. Edit 단계에서 문장을 다듬은 뒤 Feedback Agent를 열어보세요.',
          }
    }

    if (!hasJa && tab !== 'verbalize') {
      return {
        tone: 'warning',
        title: 'Feedback Agent를 쓰려면 일본어 문장이 필요합니다',
        body: '먼저 Edit 단계에서 일본어 문장을 입력하거나 AI 초안을 만든 뒤 Feedback 단계로 이동하세요.',
      }
    }

    return null
  }, [createdFromList, hasJa, tab])

  const stageSummary = {
    edit: {
      title: 'Edit',
      description: '기록을 정리하고 일본어 문장을 준비하는 단계입니다.',
    },
    feedback: {
      title: 'Feedback Agent',
      description: '문장 점검, rewrite task, 다음 질문을 받는 단계입니다.',
    },
    verbalize: {
      title: 'Insight Agent',
      description: '생각을 더 깊게 언어화하고 핵심 통찰을 얻는 단계입니다.',
    },
  } as const

  const updateSearch = (next: Partial<Record<'tab' | 'created' | 'draftJa', string | null>>) => {
    const params = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }

    setSearchParams(params, { replace: true })
  }

  const switchTab = (nextTab: Tab) => {
    if (nextTab === 'feedback' && !hasJa) return
    setTab(nextTab)
    updateSearch({ tab: nextTab, created: null })
  }

  const handleDelete = async () => {
    await deleteLog.mutateAsync(logId)
    navigate('/logs')
  }

  const handleUpdate = async (body: CreateLogBody) => {
    const updated = await updateLog.mutateAsync(body)
    const nextHasJa = Boolean(updated.praiseJa?.trim())
    const nextTab: Tab = nextHasJa ? 'feedback' : 'edit'

    setTab(nextTab)
    updateSearch({ tab: nextTab, created: null, draftJa: null })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !log) {
    return (
      <ErrorMessage
        error={error ?? new Error('로그를 불러오지 못했습니다.')}
        className="mx-auto mt-8 max-w-lg"
      />
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => navigate('/logs')}
        className="flex items-center gap-1 text-sm text-text-soft transition-colors hover:text-text-sub"
      >
        ← 로그 목록으로 돌아가기
      </button>

      <div className="journal-frame overflow-hidden p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="agent-pill mb-4">Journal Entry</p>
            <div className="mb-2 flex items-center gap-2">
              <Badge className={MOOD_COLOR[log.moodTag]}>
                {MOOD_EMOJI[log.moodTag]} {MOOD_LABELS[log.moodTag]}
              </Badge>
              {log.moodIntensity && (
                <span className="text-xs text-text-disabled">
                  {'★'.repeat(log.moodIntensity)}
                  {'☆'.repeat(5 - log.moodIntensity)}
                </span>
              )}
              <time className="text-xs text-text-disabled">{fmt.date(log.happenedAt)}</time>
            </div>

            <p className="mb-1 text-xs text-text-disabled">기록한 사건</p>
            <p className="mb-2 text-sm text-text-sub">{log.triggerKo}</p>

            {log.specificEvent && (
              <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
                  Context
                </p>
                <p className="text-xs text-amber-800">{log.specificEvent}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/60 bg-white/45 p-3">
                <p className="mb-1 text-xs text-text-disabled">자기 칭찬 문장 (한국어)</p>
                <p className="text-sm text-text-sub">{log.praiseKo}</p>
              </div>
              <div className="rounded-[1.2rem] border border-primary-100 bg-primary-50/70 p-3">
                <p className="mb-1 text-xs text-primary-500">자기 표현 문장 (일본어)</p>
                {hasJa ? (
                  <p className="text-sm font-medium text-text-main">{log.praiseJa}</p>
                ) : (
                  <p className="text-xs italic text-text-disabled">
                    아직 일본어 문장이 없습니다
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-2">
            <Button variant="ghost" size="sm" onClick={() => switchTab('edit')}>
              편집
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-accent-500 hover:bg-accent-50"
            >
              삭제
            </Button>
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={
            notice.tone === 'warning'
              ? 'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3'
              : notice.tone === 'success'
                ? 'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3'
                : 'rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3'
          }
        >
          <p className="mb-0.5 text-sm font-semibold text-text-main">{notice.title}</p>
          <p className="text-sm text-text-sub">{notice.body}</p>
        </div>
      )}

      <SectionHeader
        current={tab}
        switchTab={switchTab}
        hasJa={hasJa}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StageCard
          eyebrow="Step 1"
          title="Edit"
          description="감정, 사건, 일본어 문장을 정리해 다음 agent가 쓸 수 있는 재료를 만듭니다."
          active={tab === 'edit'}
        />
        <StageCard
          eyebrow="Step 2"
          title="Feedback Agent"
          description="문장 점검 결과와 rewrite task를 받아 일본어 표현을 개선합니다."
          active={tab === 'feedback'}
        />
        <StageCard
          eyebrow="Step 3"
          title="Insight Agent"
          description="브레인스토밍과 탐구 질문을 통해 기록의 의미를 더 깊게 해석합니다."
          active={tab === 'verbalize'}
        />
      </div>

      <p className="text-center text-xs text-text-soft">
        {stageSummary[tab].description}
      </p>

      <div className="journal-frame p-6">
        {tab === 'feedback' && <JaCheckPanel log={log} />}
        {tab === 'verbalize' && <VerbalizationFlow logId={logId} />}
        {tab === 'edit' && (
          <LogForm
            initial={log}
            onSubmit={handleUpdate}
            onCancel={() => switchTab(hasJa ? 'feedback' : 'edit')}
            submitLabel="저장하고 계속하기"
            savedLogId={logId}
            initialStep={autoDraftJa && !hasJa ? 3 : 1}
            autoDraftJa={autoDraftJa && !hasJa}
            onDraftApplied={() => updateSearch({ draftJa: null, created: null })}
          />
        )}
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="이 로그를 삭제할까요?"
        size="sm"
      >
        <p className="mb-5 text-sm text-text-sub">
          삭제하면 기록과 연결된 피드백/언어화 흐름을 다시 복구할 수 없습니다.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
            취소
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={deleteLog.isPending}
            onClick={handleDelete}
          >
            삭제
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function SectionHeader({
  current,
  switchTab,
  hasJa,
}: {
  current: Tab
  switchTab: (nextTab: Tab) => void
  hasJa: boolean
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface-elevated p-1">
      {([
        { key: 'edit', label: 'Edit', disabled: false },
        { key: 'feedback', label: 'Feedback', disabled: !hasJa },
        { key: 'verbalize', label: 'Insight', disabled: false },
      ] as const).map(({ key, label, disabled }) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => switchTab(key)}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            current === key
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-text-sub hover:bg-surface-subtle'
          } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
