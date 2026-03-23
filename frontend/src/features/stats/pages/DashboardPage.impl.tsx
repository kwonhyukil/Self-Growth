import { Link } from 'react-router-dom'
import { useSummary, useDashboard } from '@/features/stats/queries'
import { CoachChatPanel } from '@/features/ai/chat/components/CoachChatPanel'
import { useLogs } from '@/features/logs/queries'
import { useAuthContext } from '@/features/auth/auth-provider'
import { StatCard } from '@/features/stats/components/SummaryCards'
import { MoodDistribution } from '@/features/stats/components/MoodDistribution'
import { LogCard } from '@/features/logs/components/LogCard'
import { GrowthWidget } from '@/features/growth/components/GrowthWidget'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'
import { RULE_TAG_LABEL, MOOD_EMOJI } from '@/shared/lib/constants'
import type { RuleTag, MoodTag } from '@/types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
      <h2 className="section-label mb-4">{title}</h2>
      {children}
    </div>
  )
}

function AgentCard({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-disabled">
        {eyebrow}
      </p>
      <h3 className="text-base font-semibold text-text-main">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-text-sub">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

function OnboardingCard() {
  const actions = [
    {
      icon: '📝',
      title: '첫 로그 작성',
      desc: '오늘 있었던 일과 내 감정을 짧게 적어 첫 기록을 시작합니다.',
      to: '/logs',
    },
    {
      icon: '🤖',
      title: 'AI 피드백 받기',
      desc: '일본어 문장을 적은 뒤 Feedback Agent에게 점검을 요청합니다.',
      to: '/logs',
    },
    {
      icon: '🧠',
      title: 'Insight 만들기',
      desc: '언어화 과정을 통해 생각을 더 깊게 정리하고 통찰을 남깁니다.',
      to: '/stats',
    },
  ]

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/30 p-8">
      <div className="mb-7 text-center">
        <div className="mb-3 text-4xl">🌱</div>
        <h2 className="text-lg font-bold text-text-main">첫 기록부터 AI 코칭까지 한 흐름으로 시작하세요</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-text-soft">
          이 앱은 기록, 피드백, 인사이트를 나눠서 보여주지만 사용자에게는 하나의 성장 흐름으로 이어지도록 설계되어 있습니다.
        </p>
      </div>

      <div className="mb-7 grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.to}
            className="group rounded-xl border border-border-subtle bg-surface-elevated p-5 text-center shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-activity"
          >
            <span className="text-3xl">{action.icon}</span>
            <p className="mt-3 text-sm font-bold text-text-main transition-colors group-hover:text-primary-700">
              {action.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-text-soft">{action.desc}</p>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link to="/logs">
          <Button leftIcon={<span>📝</span>} size="lg" className="px-10">
            첫 로그 작성하기
          </Button>
        </Link>
        <p className="mt-2 text-xs text-text-soft">3분이면 시작할 수 있습니다</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuthContext()
  const { data: summary, isLoading: sumLoading } = useSummary()
  const { data: dashboard, isLoading: dashLoading } = useDashboard()
  const { data: logs } = useLogs()

  const isLoading = sumLoading || dashLoading
  const hasLogs = (summary?.totalLogs ?? 0) > 0

  const topMood = summary?.moodCount
    ? (Object.entries(summary.moodCount)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)[0]?.[0] as MoodTag | undefined)
    : undefined

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">
            {hasLogs
              ? `${user?.name ? `${user.name}님, ` : ''}오늘도 성장 흐름을 이어가볼까요?`
              : `${user?.name ? `${user.name}님, ` : ''}첫 로그부터 시작해볼까요?`}
          </h1>
          <p className="mt-0.5 text-sm text-text-disabled">
            {hasLogs
              ? 'Chat Agent, Feedback Agent, Insight Agent를 한 화면에서 이어서 사용할 수 있습니다.'
              : '기록을 남기면 AI 코치가 다음 행동을 자연스럽게 안내해줍니다.'}
          </p>

          {hasLogs && summary && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {summary.streak >= 1 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-sub">
                  🔥 {summary.streak}일 연속
                </span>
              )}
              {topMood && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-sub">
                  가장 많은 감정 {MOOD_EMOJI[topMood]}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-sub">
                로그 {summary.totalLogs}개
              </span>
            </div>
          )}
        </div>

        {hasLogs && (
          <Link to="/logs" className="shrink-0">
            <Button leftIcon={<span>📝</span>}>새 로그 쓰기</Button>
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6 animate-fade-in">
          {!hasLogs && <OnboardingCard />}

          {hasLogs && summary && (
            <>
              <GrowthWidget />

              <Section title="AI Workspace">
                <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
                  <AgentCard
                    eyebrow="Chat Agent"
                    title="지금 무엇을 해야 할지 코치에게 물어보세요"
                    description="자유롭게 질문하면 코치가 현재 맥락을 보고 기록, 피드백, 인사이트 중 어디로 가야 할지 제안합니다."
                  >
                    <CoachChatPanel />
                  </AgentCard>

                  {dashboard?.coach?.week && (
                    <AgentCard
                      eyebrow="Feedback Agent"
                      title="이번 주에 가장 먼저 다듬을 포인트"
                      description={dashboard.coach.week.why}
                      action={
                        <Link to="/logs">
                          <Button size="sm" variant="secondary">
                            피드백 받을 로그 열기
                          </Button>
                        </Link>
                      }
                    >
                      <div className="space-y-3 text-sm text-text-sub">
                        <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary-500">
                            Focus Rule
                          </p>
                          <p className="font-semibold text-primary-800">
                            {RULE_TAG_LABEL[dashboard.coach.week.focusRuleTag as RuleTag] ??
                              dashboard.coach.week.focusRuleTag}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
                            One Action
                          </p>
                          <p>{dashboard.coach.week.oneAction}</p>
                        </div>
                      </div>
                    </AgentCard>
                  )}

                  {dashboard?.insights?.weekTopFocus && (
                    <AgentCard
                      eyebrow="Insight Agent"
                      title="이번 주 인사이트를 한 번 더 정리해보세요"
                      description="누적된 피드백과 기록 패턴을 바탕으로 다음 질문과 후속 포인트를 제안합니다."
                      action={
                        <Link to="/stats">
                          <Button size="sm" variant="secondary">
                            인사이트 자세히 보기
                          </Button>
                        </Link>
                      }
                    >
                      <div className="space-y-3 text-sm text-text-sub">
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
                            Next Question
                          </p>
                          <p className="italic">&ldquo;{dashboard.coach.week.nextQuestion}&rdquo;</p>
                        </div>
                        {dashboard.insights.nextTargets.length > 0 && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-disabled">
                              Next Targets
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {dashboard.insights.nextTargets.slice(0, 2).map((target) => (
                                <span
                                  key={target.ruleTag}
                                  className="rounded-full border border-border-subtle bg-surface-elevated px-3 py-1 text-xs text-text-sub"
                                >
                                  {RULE_TAG_LABEL[target.ruleTag as RuleTag] ?? target.ruleTag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AgentCard>
                  )}
                </div>
              </Section>

              {logs && logs.length > 0 && (
                <Section title="최근 로그">
                  <div className="space-y-3">
                    {logs.slice(0, 3).map((log) => (
                      <LogCard key={log.id} log={log} />
                    ))}
                  </div>
                  {logs.length > 3 && (
                    <div className="mt-4 text-center">
                      <Link to="/logs" className="text-sm font-medium text-primary-500 hover:underline">
                        모든 로그 보기 ({logs.length}개) →
                      </Link>
                    </div>
                  )}
                </Section>
              )}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon="🗂" label="전체 로그" value={summary.totalLogs} highlight />
                <StatCard icon="📆" label="최근 7일" value={summary.last7DaysCount} sub="작성 수" />
                <StatCard
                  icon="🔥"
                  label="연속 기록"
                  value={`${summary.streak}일`}
                  highlight={summary.streak >= 3}
                />
                <StatCard
                  icon="🙂"
                  label="상위 감정"
                  value={
                    Object.entries(summary.moodCount)
                      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? '-'
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Section title="감정 분포">
                  <MoodDistribution moodCount={summary.moodCount} />
                </Section>

                {dashboard?.insights?.nextTargets && dashboard.insights.nextTargets.length > 0 && (
                  <Section title="다음에 챙겨볼 포인트">
                    <div className="space-y-2">
                      {dashboard.insights.nextTargets.slice(0, 4).map((target, index) => (
                        <div
                          key={target.ruleTag}
                          className="flex items-start gap-3 rounded-xl bg-surface-subtle px-3 py-2.5 transition-colors hover:bg-primary-50"
                        >
                          <span className="shrink-0 text-sm font-bold text-primary-500">#{index + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-text-sub">
                              {RULE_TAG_LABEL[target.ruleTag as RuleTag] ?? target.ruleTag}
                            </p>
                            <p className="mt-0.5 text-xs text-text-disabled">{target.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
