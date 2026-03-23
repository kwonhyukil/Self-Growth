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

function WritingPath() {
  const items = [
    {
      title: 'Journal',
      desc: '오늘의 장면과 감정을 짧게 적어 시작합니다.',
    },
    {
      title: 'Feedback',
      desc: '일본어 문장을 점검하고 rewrite task를 받습니다.',
    },
    {
      title: 'Insight',
      desc: '생각을 확장하고 기록의 의미를 언어화합니다.',
    },
  ]

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item, index) => (
        <div key={item.title} className="rounded-2xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
            Step {index + 1}
          </p>
          <p className="text-sm font-semibold text-text-main">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-text-sub">{item.desc}</p>
        </div>
      ))}
    </div>
  )
}

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
      <section className="journal-frame overflow-hidden">
        <div className="grid gap-8 px-7 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-10">
          <div>
            <p className="agent-pill">Calm Journal</p>
            <h1 className="journal-title mt-4">Write first. Refine gently. Understand deeply.</h1>
            <p className="mt-4 max-w-2xl text-bodySm leading-relaxed text-text-sub">
              로그는 단순한 기록 보관함이 아니라, 감정 기록에서 AI 피드백과 인사이트까지 이어지는 작업 공간입니다.
              오늘 있었던 장면을 남기고, 일본어 문장을 다듬고, 다음 질문으로 생각을 확장해보세요.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setShowForm(true)} leftIcon={<span>✍</span>} size="lg">
                새 로그 쓰기
              </Button>
              {logs && logs.length > 0 && (
                <Badge variant="outline" className="rounded-full px-4 py-2 text-xs">
                  Saved journals {logs.length}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,248,240,0.7))] p-6 shadow-soft">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
              Writing Ritual
            </p>
            <WritingPath />
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="journal-frame flex justify-center py-16">
          <Spinner size="lg" variant="levels" />
        </div>
      )}

      {error && <ErrorMessage error={error} className="mb-4" />}

      {!isLoading && !error && (
        <>
          {logs && logs.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="agent-pill">Journal Archive</p>
                  <h2 className="mt-3 text-h2">Recent entries</h2>
                </div>
                <p className="max-w-md text-right text-sm text-text-soft">
                  가장 최근의 기록부터 확인하고, 필요한 로그에서 Feedback Agent와 Insight Agent로 이어가세요.
                </p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {logs.map((log) => (
                  <LogCard key={log.id} log={log} />
                ))}
              </div>
            </section>
          ) : (
            <section className="journal-frame px-8 py-12 text-center">
              <div className="mx-auto max-w-2xl">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/70 bg-white/65 text-4xl shadow-soft">
                  🌾
                </div>
                <p className="agent-pill">First Entry</p>
                <h2 className="mt-4 text-h2">아직 첫 로그가 없습니다</h2>
                <p className="mt-3 text-bodySm leading-relaxed text-text-sub">
                  오늘 가장 선명했던 장면 하나와 그때의 감정을 적는 것만으로 충분합니다.
                  저장한 뒤에는 일본어 초안을 만들고 Feedback Agent로 바로 이어갈 수 있습니다.
                </p>
                <div className="mx-auto mt-8 max-w-md rounded-[1.8rem] border border-white/70 bg-white/55 p-5 text-left shadow-soft">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge>😊 기쁨</Badge>
                    <span className="text-xs text-text-disabled">Example Note</span>
                  </div>
                  <p className="text-sm leading-relaxed text-text-sub">
                    발표는 떨렸지만, 마지막까지 내 생각을 다 말하고 내려왔다.
                  </p>
                  <p className="mt-3 text-sm font-medium italic text-primary-700">
                    긴장했어도 끝까지 말한 나를 인정해주고 싶다.
                  </p>
                </div>
                <Button className="mt-8" size="lg" onClick={() => setShowForm(true)}>
                  첫 로그 작성하기
                </Button>
              </div>
            </section>
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
