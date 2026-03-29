import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useLog, useDeleteLog, useUpdateLog } from '@/features/logs/queries'
import { JaCheckPanel } from '@/features/logs/ja-check/components/JaCheckPanel'
import { LogForm } from '@/features/logs/components/LogForm'
import { VerbalizationFlow } from '@/features/logs/verbalization/components/VerbalizationFlow'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import {
  LogDetailDeleteModal,
  LogDetailHeader,
  LogDetailNotice,
  LogDetailSectionHeader,
  LogDetailStageGuide,
} from '@/features/logs/components/LogDetailSections'
import type { CreateLogBody } from '@/types'

type Tab = 'feedback' | 'verbalize' | 'edit'

function parseTab(value: string | null): Tab | null {
  if (value === 'feedback' || value === 'verbalize' || value === 'edit') return value
  return null
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
            tone: 'success' as const,
            title: '로그를 저장했습니다',
            body: '기록은 저장되었고 일본어 문장도 들어 있습니다. 이제 Feedback Agent로 점검하거나 Insight Agent로 더 깊게 정리할 수 있습니다.',
          }
        : {
            tone: 'info' as const,
            title: '로그를 저장했습니다',
            body: '다음 단계는 일본어 문장을 정리하는 것입니다. Edit 단계에서 문장을 다듬은 뒤 Feedback Agent를 열어보세요.',
          }
    }

    if (!hasJa && tab !== 'verbalize') {
      return {
        tone: 'warning' as const,
        title: 'Feedback Agent를 쓰려면 일본어 문장이 필요합니다',
        body: '먼저 Edit 단계에서 일본어 문장을 입력하거나 AI 초안을 만든 뒤 Feedback 단계로 이동하세요.',
      }
    }

    return null
  }, [createdFromList, hasJa, tab])

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

      <LogDetailHeader
        log={log}
        hasJa={hasJa}
        onEdit={() => switchTab('edit')}
        onDelete={() => setConfirmDelete(true)}
      />

      <LogDetailNotice notice={notice} />

      <LogDetailSectionHeader current={tab} switchTab={switchTab} hasJa={hasJa} />
      <LogDetailStageGuide tab={tab} />

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

      <LogDetailDeleteModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onDelete={handleDelete}
        isDeleting={deleteLog.isPending}
      />
    </div>
  )
}
