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
            title: 'ログを保存しました',
            body: '日本語の振り返りが入りました。このまま内容を整えるか、AIフィードバックへ進めます。',
          }
        : {
            tone: 'info',
            title: 'ログを保存しました',
            body: '次は日本語の振り返りを整える段階です。必要ならAI下書きを使って始められます。',
          }
    }

    if (!hasJa && tab !== 'verbalize') {
      return {
        tone: 'warning',
        title: 'AIフィードバックの前に日本語の振り返りが必要です',
        body: 'まずは編集タブで日本語の文を用意すると、フィードバックと書き直しに進めます。',
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
        error={error ?? new Error('ログを読み込めませんでした。')}
        className="mx-auto mt-8 max-w-lg"
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => navigate('/logs')}
        className="flex items-center gap-1 text-sm text-text-soft transition-colors hover:text-text-sub"
      >
        ← ログ一覧へ戻る
      </button>

      <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
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

            <p className="mb-1 text-xs text-text-disabled">きっかけ</p>
            <p className="mb-2 text-sm text-text-sub">{log.triggerKo}</p>

            {log.specificEvent && (
              <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                  補足メモ
                </p>
                <p className="text-xs text-amber-800">{log.specificEvent}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="mb-1 text-xs text-text-disabled">自分にかけたいひと言（韓国語）</p>
                <p className="text-sm text-text-sub">{log.praiseKo}</p>
              </div>
              <div className="rounded-lg border border-primary-100 bg-primary-50 p-3">
                <p className="mb-1 text-xs text-primary-500">日本語の振り返り</p>
                {hasJa ? (
                  <p className="text-sm font-medium text-text-main">{log.praiseJa}</p>
                ) : (
                  <p className="text-xs italic text-text-disabled">
                    まだ日本語の振り返りはありません
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-2">
            <Button variant="ghost" size="sm" onClick={() => switchTab('edit')}>
              編集
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-accent-500 hover:bg-accent-50"
            >
              削除
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

      <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface-elevated p-1">
        {([
          { key: 'edit', label: '記録を整える', disabled: false },
          { key: 'feedback', label: 'AIフィードバック', disabled: !hasJa },
          { key: 'verbalize', label: '言語化', disabled: false },
        ] as const).map(({ key, label, disabled }) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => switchTab(key)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-text-sub hover:bg-surface-subtle'
            } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-text-soft">
        {tab === 'edit'
          ? '記録を整えてから次のステップへ進みます。'
          : tab === 'feedback'
            ? '日本語の振り返りに対するAIコーチのコメントを確認します。'
            : '出来事の背景を言葉にして、自分の理解を深めます。'}
      </p>

      <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
        {tab === 'feedback' && <JaCheckPanel log={log} />}
        {tab === 'verbalize' && <VerbalizationFlow logId={logId} />}
        {tab === 'edit' && (
          <LogForm
            initial={log}
            onSubmit={handleUpdate}
            onCancel={() => switchTab(hasJa ? 'feedback' : 'edit')}
            submitLabel="保存して続ける"
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
        title="このログを削除しますか？"
        size="sm"
      >
        <p className="mb-5 text-sm text-text-sub">
          削除すると、このログの振り返り内容と関連履歴は元に戻せません。
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
            キャンセル
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={deleteLog.isPending}
            onClick={handleDelete}
          >
            削除する
          </Button>
        </div>
      </Modal>
    </div>
  )
}
