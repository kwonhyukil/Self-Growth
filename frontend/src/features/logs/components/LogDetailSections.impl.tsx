import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Badge } from '@/shared/ui/Badge'
import { MOOD_COLOR, MOOD_EMOJI, MOOD_LABELS } from '@/shared/lib/constants'
import { fmt } from '@/shared/lib/formatters'
import type { GrowthLog } from '@/types'

type Tab = 'feedback' | 'verbalize' | 'edit'

export function LogDetailHeader({
  log,
  hasJa,
  onEdit,
  onDelete,
}: {
  log: GrowthLog
  hasJa: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
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
                <p className="text-xs italic text-text-disabled">아직 일본어 문장이 없습니다</p>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 space-y-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            편집
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-accent-500 hover:bg-accent-50"
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  )
}

export function LogDetailNotice({
  notice,
}: {
  notice:
    | {
        tone: 'warning' | 'success' | 'info'
        title: string
        body: string
      }
    | null
}) {
  if (!notice) return null

  return (
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
  )
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
        active ? 'border-primary-200 bg-primary-50/80' : 'border-white/60 bg-white/45'
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

export function LogDetailStageGuide({ tab }: { tab: Tab }) {
  const stageSummary = {
    edit: {
      description: '기록을 정리하고 일본어 문장을 준비하는 단계입니다.',
    },
    feedback: {
      description: '문장 점검, rewrite task, 다음 질문을 받는 단계입니다.',
    },
    verbalize: {
      description: '생각을 더 깊게 언어화하고 핵심 통찰을 얻는 단계입니다.',
    },
  } as const

  return (
    <>
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

      <p className="text-center text-xs text-text-soft">{stageSummary[tab].description}</p>
    </>
  )
}

export function LogDetailSectionHeader({
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

export function LogDetailDeleteModal({
  open,
  onClose,
  onDelete,
  isDeleting,
}: {
  open: boolean
  onClose: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title="이 로그를 삭제할까요?" size="sm">
      <p className="mb-5 text-sm text-text-sub">
        삭제하면 기록과 연결된 피드백/언어화 흐름을 다시 복구할 수 없습니다.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          취소
        </Button>
        <Button variant="danger" className="flex-1" isLoading={isDeleting} onClick={onDelete}>
          삭제
        </Button>
      </div>
    </Modal>
  )
}
