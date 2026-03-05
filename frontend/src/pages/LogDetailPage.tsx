import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLog, useDeleteLog, useUpdateLog } from '../hooks/useLogs'
import { JaCheckPanel } from '../components/jaCheck/JaCheckPanel'
import { LogForm } from '../components/logs/LogForm'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Badge } from '../components/ui/Badge'
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLOR } from '../utils/constants'
import { fmt } from '../utils/formatters'
import type { CreateLogBody } from '../types'

type Tab = 'feedback' | 'edit'

export function LogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const logId = Number(id)
  const navigate = useNavigate()

  const { data: log, isLoading, error } = useLog(logId)
  const deleteLog = useDeleteLog()
  const updateLog = useUpdateLog(logId)

  const [tab, setTab] = useState<Tab>('feedback')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    await deleteLog.mutateAsync(logId)
    navigate('/logs')
  }

  const handleUpdate = async (body: CreateLogBody) => {
    await updateLog.mutateAsync(body)
    setTab('feedback')
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  )

  if (error || !log) return (
    <ErrorMessage error={error ?? new Error('ログが見つかりません')} className="max-w-lg mx-auto mt-8" />
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/logs')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        ← ログ一覧に戻る
      </button>

      {/* Log header card */}
      <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={MOOD_COLOR[log.moodTag]}>
                {MOOD_EMOJI[log.moodTag]} {MOOD_LABELS[log.moodTag]}
              </Badge>
              <time className="text-xs text-slate-400">{fmt.date(log.happenedAt)}</time>
            </div>
            <p className="text-xs text-slate-400 mb-1">きっかけ</p>
            <p className="text-sm text-slate-700 mb-4">{log.triggerKo}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="text-xs text-slate-400 mb-1">称賛（母語）</p>
                <p className="text-sm text-slate-700">{log.praiseKo}</p>
              </div>
              <div className="rounded-lg bg-brand-50 p-3 border border-brand-100">
                <p className="text-xs text-brand-500 mb-1">称賛（日本語）</p>
                <p className="text-sm text-slate-800 font-medium">{log.praiseJa}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab('edit')}
            >
              編集
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-red-500 hover:bg-red-50"
            >
              削除
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-surface-border bg-white p-1 gap-1">
        {([
          { key: 'feedback', label: '🤖 AIフィードバック' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
        {tab === 'feedback' && <JaCheckPanel log={log} />}
        {tab === 'edit' && (
          <LogForm
            initial={log}
            onSubmit={handleUpdate}
            onCancel={() => setTab('feedback')}
            submitLabel="変更を保存"
          />
        )}
      </div>

      {/* Delete confirm modal */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="ログを削除しますか？"
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-5">
          この操作は取り消せません。このログとすべての関連データが削除されます。
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirmDelete(false)}
          >
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
