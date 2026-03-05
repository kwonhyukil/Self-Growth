import { useState } from 'react'
import { useLogs, useCreateLog } from '../hooks/useLogs'
import { LogCard } from '../components/logs/LogCard'
import { LogForm } from '../components/logs/LogForm'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { ErrorMessage, EmptyState } from '../components/ui/ErrorMessage'
import type { CreateLogBody } from '../types'

export function LogsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: logs, isLoading, error } = useLogs()
  const createLog = useCreateLog()

  const handleCreate = async (body: CreateLogBody) => {
    await createLog.mutateAsync(body)
    setShowForm(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">成長ログ</h1>
          <p className="text-sm text-slate-500 mt-0.5">あなたの成長の軌跡を記録しましょう</p>
        </div>
        <Button onClick={() => setShowForm(true)} leftIcon={<span>＋</span>}>
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
            <EmptyState
              icon="📝"
              title="まだログがありません"
              description="最初の成長ログを記録してみましょう！"
              action={
                <Button onClick={() => setShowForm(true)}>
                  最初のログを作成
                </Button>
              }
            />
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
