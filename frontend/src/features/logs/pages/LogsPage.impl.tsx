import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogs, useCreateLog } from '@/features/logs/queries'
import { LogForm } from '@/features/logs/components/LogForm'
import { LogsPageArchive, LogsPageEmptyState, LogsPageHero } from '@/features/logs/components/LogsPageSections'
import { Modal } from '@/shared/ui/Modal'
import { Spinner } from '@/shared/ui/Spinner'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'
import type { CreateLogBody } from '@/types'

export function LogsPage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const { data: logs, isLoading, error } = useLogs()
  const createLog = useCreateLog()

  const handleCreate = async (body: CreateLogBody) => {
    const created = await createLog.mutateAsync(body)
    setShowForm(false)
    navigate(`/logs/${created.id}?tab=edit&created=1&draftJa=1`)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <LogsPageHero logCount={logs?.length ?? 0} onCreate={() => setShowForm(true)} />

      {isLoading && (
        <div className="journal-frame flex justify-center py-16">
          <Spinner size="lg" variant="levels" />
        </div>
      )}

      {error && <ErrorMessage error={error} className="mb-4" />}

      {!isLoading && !error && (
        <>
          {logs && logs.length > 0 ? (
            <LogsPageArchive logs={logs} />
          ) : (
            <LogsPageEmptyState onCreate={() => setShowForm(true)} />
          )}
        </>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="새 로그 쓰기"
        size="lg"
        closeOnBackdrop={false}
        closeOnEscape={false}
      >
        <LogForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          submitLabel="저장하고 다음 단계로"
        />
      </Modal>
    </div>
  )
}
