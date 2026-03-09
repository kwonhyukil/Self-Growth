import { useState } from 'react'
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
  const [showForm, setShowForm] = useState(false)
  const { data: logs, isLoading, error } = useLogs()
  const createLog = useCreateLog()

  const isEmpty = !logs || logs.length === 0

  const handleCreate = async (body: CreateLogBody) => {
    await createLog.mutateAsync(body)
    setShowForm(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-main">成長ログ</h1>
          <p className="text-sm text-text-soft mt-0.5">あなたの成長の軌跡を記録しましょう</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          leftIcon={<span>＋</span>}
          variant={isEmpty ? 'secondary' : 'primary'}
        >
          新しいログ
        </Button>
      </div>

      {/* Content */}
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
            /* ── 가이드형 Empty State ── */
            <div className="rounded-2xl border border-dashed border-border bg-surface-elevated p-10 text-center animate-fade-in">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-base font-bold text-text-main">まだログがありません</h3>
              <p className="mt-1.5 text-sm text-text-sub">
                今日の出来事や感情を1つ記録してみましょう
              </p>
              <p className="mt-1 text-xs text-text-soft">
                小さな記録が日本語表現と自己理解につながります
              </p>

              {/* 샘플 로그 미리보기 */}
              <div className="mt-6 rounded-xl bg-surface-subtle border border-border-subtle p-4 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>😊 喜び</Badge>
                  <span className="text-xs text-text-disabled">記録の例</span>
                </div>
                <p className="text-sm text-text-sub line-clamp-2">
                  発表を最後までやり切った
                </p>
                <p className="mt-2 text-sm text-primary-600 italic leading-relaxed">
                  「緊張しても最後まで続けた自分を褒めたい」
                </p>
              </div>

              <Button className="mt-6" size="lg" onClick={() => setShowForm(true)}>
                最初のログを作成
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="新しい成長ログ"
        size="lg"
      >
        <LogForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          submitLabel="ログを記録する"
        />
      </Modal>
    </div>
  )
}
