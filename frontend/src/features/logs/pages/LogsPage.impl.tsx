import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogs, useCreateLog } from '@/features/logs/queries'
import { LogCard } from '@/features/logs/components/LogCard'
import { LogForm } from '@/features/logs/components/LogForm'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import { Badge } from '@/shared/ui/Badge'
import type { CreateLogBody } from '@/types'

export function LogsPage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const { data: logs, isLoading, error } = useLogs()
  const createLog = useCreateLog()

  const isEmpty = !logs || logs.length === 0

  const handleCreate = async (body: CreateLogBody) => {
    const created = await createLog.mutateAsync(body)
    setShowForm(false)
    navigate(`/logs/${created.id}?tab=edit&created=1&draftJa=1`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">ログ</h1>
          <p className="mt-0.5 text-sm text-text-soft">
            今日の出来事と気持ちを書き留めて、AIコーチと次の一歩につなげましょう。
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          leftIcon={<span>＋</span>}
          variant={isEmpty ? 'secondary' : 'primary'}
        >
          新しいログ
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && <ErrorMessage error={error} className="mb-4" />}

      {!isLoading && !error && (
        <>
          {logs && logs.length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              {logs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface-elevated p-10 text-center animate-fade-in">
              <div className="mb-4 text-5xl">📝</div>
              <h3 className="text-base font-bold text-text-main">まだログがありません</h3>
              <p className="mt-1.5 text-sm text-text-sub">
                きっかけと自分へのひと言を書くだけで、最初の記録を始められます。
              </p>
              <p className="mt-1 text-xs text-text-soft">
                保存したあと、自動で編集画面に移動して日本語の下書きやAIフィードバックへ進めます。
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border-subtle bg-surface-subtle p-4 text-left">
                <div className="mb-2 flex items-center gap-2">
                  <Badge>😊 喜び</Badge>
                  <span className="text-xs text-text-disabled">今日の記録例</span>
                </div>
                <p className="text-sm text-text-sub line-clamp-2">
                  発表は緊張したけれど、最後まで自分の考えを伝え切れた。
                </p>
                <p className="mt-2 text-sm italic leading-relaxed text-primary-600">
                  緊張していても最後まで話し切れた自分を認めたい。
                </p>
              </div>

              <Button className="mt-6" size="lg" onClick={() => setShowForm(true)}>
                最初のログを書く
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="新しいログを書く"
        size="lg"
        closeOnBackdrop={false}
        closeOnEscape={false}
      >
        <LogForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          submitLabel="保存して次へ"
        />
      </Modal>
    </div>
  )
}
