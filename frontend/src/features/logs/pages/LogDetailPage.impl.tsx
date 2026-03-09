import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
        className="flex items-center gap-1 text-sm text-text-soft hover:text-text-sub transition-colors"
      >
        ← ログ一覧に戻る
      </button>

      {/* Log header card */}
      <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={MOOD_COLOR[log.moodTag]}>
                {MOOD_EMOJI[log.moodTag]} {MOOD_LABELS[log.moodTag]}
              </Badge>
              {log.moodIntensity && (
                <span className="text-xs text-text-disabled">
                  {'★'.repeat(log.moodIntensity)}{'☆'.repeat(5 - log.moodIntensity)}
                </span>
              )}
              <time className="text-xs text-text-disabled">{fmt.date(log.happenedAt)}</time>
            </div>

            <p className="text-xs text-text-disabled mb-1">きっかけ</p>
            <p className="text-sm text-text-sub mb-2">{log.triggerKo}</p>

            {log.specificEvent && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 mb-0.5">具体的なできごと</p>
                <p className="text-xs text-amber-800">{log.specificEvent}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-subtle p-3">
                <p className="text-xs text-text-disabled mb-1">称賛（母語）</p>
                <p className="text-sm text-text-sub">{log.praiseKo}</p>
              </div>
              <div className="rounded-lg bg-primary-50 p-3 border border-primary-100">
                <p className="text-xs text-primary-500 mb-1">称賛（日本語）</p>
                {log.praiseJa ? (
                  <p className="text-sm text-text-main font-medium">{log.praiseJa}</p>
                ) : (
                  <p className="text-xs text-text-disabled italic">まだ入力していません</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setTab('edit')}>
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

      {/* 次のおすすめ — ヘッダーとタブの間 */}
      {tab !== 'edit' && (() => {
        const item = !log.praiseJa
          ? { icon: '🌸', msg: '日本語の称賛を追加してみましょう', sub: 'AIが下書きを作れます。編集から追加できます' }
          : tab !== 'verbalize'
          ? { icon: '🤖', msg: 'AIフィードバックを受けて表現を磨いてみましょう', sub: 'フィードバックタブで日本語チェックができます' }
          : { icon: '🧠', msg: '3分ブレインダンプで思考を深めましょう', sub: '言語化プロセスタブで開始できます' }
        return (
          <div className="flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3">
            <span className="text-2xl shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary-500 mb-0.5">次のおすすめ</p>
              <p className="text-sm font-semibold text-primary-800">{item.msg}</p>
              <p className="text-xs text-primary-500 mt-0.5">{item.sub}</p>
            </div>
          </div>
        )
      })()}

      {/* Tabs */}
      <div className="flex rounded-lg border border-border-subtle bg-surface-elevated p-1 gap-1">
        {([
          { key: 'feedback',  label: '🤖 AIフィードバック' },
          { key: 'verbalize', label: '🧠 言語化プロセス' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-text-sub hover:bg-surface-subtle'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* タブ目的説明 */}
      {tab !== 'edit' && (
        <p className="text-xs text-text-soft text-center -mt-3">
          {tab === 'feedback'
            ? '日本語の文法・表現を AIがチェックします'
            : '気持ちを言語化して自己理解を深めます'}
        </p>
      )}

      {/* Tab content */}
      <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
        {tab === 'feedback'  && <JaCheckPanel log={log} />}
        {tab === 'verbalize' && <VerbalizationFlow logId={logId} />}
        {tab === 'edit' && (
          <LogForm
            initial={log}
            onSubmit={handleUpdate}
            onCancel={() => setTab('feedback')}
            submitLabel="変更を保存"
            savedLogId={logId}
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
        <p className="text-sm text-text-sub mb-5">
          この操作は取り消せません。このログとすべての関連データが削除されます。
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
