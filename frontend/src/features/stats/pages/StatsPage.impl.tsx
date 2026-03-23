import { useState } from 'react'
import { useSummary, useJaImprovement } from '@/features/stats/queries'
import { StatCard } from '@/features/stats/components/SummaryCards'
import { MoodDistribution } from '@/features/stats/components/MoodDistribution'
import { TrendChart } from '@/features/stats/components/TrendChart'
import { Spinner } from '@/shared/ui/Spinner'
import { RULE_TAG_LABEL } from '@/shared/lib/constants'
import type { RuleTag } from '@/types'
import { clsx } from 'clsx'

const DAYS_OPTIONS = [7, 30, 90] as const
type Days = (typeof DAYS_OPTIONS)[number]

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span className="text-3xl opacity-30">{icon}</span>
      <p className="max-w-[220px] text-sm leading-relaxed text-text-disabled">{message}</p>
    </div>
  )
}

function fmtNum(n: number | undefined | null, decimals = 1): string {
  if (n == null || n === 0) return '—'
  return Number(n).toFixed(decimals)
}

export function StatsPage() {
  const [days, setDays] = useState<Days>(30)
  const { data: summary, isLoading: sumLoading } = useSummary()
  const { data: jaStats, isLoading: jaLoading } = useJaImprovement(days)

  const isLoading = sumLoading || jaLoading
  const hasRevisionData = (jaStats?.totalRevisions ?? 0) > 0

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="journal-frame overflow-hidden px-7 py-8 md:px-10 md:py-10">
        <p className="agent-pill">Insight Overview</p>
        <h1 className="journal-title mt-4">Growth signals and language trends</h1>
        <p className="mt-4 max-w-2xl text-bodySm leading-relaxed text-text-sub">
          로그 수, 교정 흐름, 감정 분포를 함께 보며 어떤 습관이 쌓이고 있고 어디를 다듬어야 하는지 한 화면에서 확인합니다.
        </p>
      </section>

      {isLoading && (
        <div className="journal-frame flex justify-center py-16">
          <Spinner size="lg" variant="levels" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6 animate-fade-in">
          {summary && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon="🗂" label="전체 로그" value={summary.totalLogs} />
              <StatCard icon="🔥" label="연속 기록" value={`${summary.streak}일`} highlight />
              <StatCard icon="📆" label="최근 7일" value={summary.last7DaysCount} sub="작성 수" />
              <StatCard
                icon="✍"
                label="교정 시도"
                value={jaStats ? `${jaStats.totalRevisions}회` : '—'}
                sub="rewrite 기준"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-soft">기간</span>
            <div className="flex gap-1 rounded-full border border-white/70 bg-white/55 p-1 shadow-soft">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={clsx(
                    'rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                    days === d ? 'bg-primary-500 text-white shadow-soft' : 'text-text-soft hover:text-text-sub',
                  )}
                >
                  {d}일
                </button>
              ))}
            </div>
          </div>

          {jaStats && jaStats.trend.length > 0 && (
            <div className="journal-frame p-6">
              <h2 className="section-label mb-1">Correction Trend · {days} days</h2>
              <p className="mb-4 text-xs text-text-soft">최근 교정 결과가 어느 방향으로 움직이는지 보여줍니다.</p>
              <TrendChart trend={jaStats.trend} />
            </div>
          )}

          {jaStats ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="journal-frame p-6">
                <h2 className="section-label mb-5">Feedback Summary · {days} days</h2>

                {!hasRevisionData ? (
                  <EmptyState icon="✍" message={`${days}일 동안 아직 rewrite 이력이 없습니다.`} />
                ) : (
                  <div className="space-y-1">
                    <Row label="교정 횟수" value={`${jaStats.totalRevisions}회`} />
                    <Row
                      label="누적 문제 변화"
                      value={
                        jaStats.totalDeltaIssueCount < 0
                          ? `${Math.abs(jaStats.totalDeltaIssueCount)}개 감소`
                          : fmtNum(jaStats.totalDeltaIssueCount, 0)
                      }
                      highlight={jaStats.totalDeltaIssueCount < 0}
                    />
                    <Row label="평균 변화 / 회" value={fmtNum(jaStats.avgDeltaIssueCount)} />

                    <div className="pt-4">
                      <p className="mb-2.5 text-xs text-text-disabled">Severity distribution</p>
                      <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map((severity) => {
                          const value = jaStats.severityDistribution[severity]
                          const styles = {
                            high: 'bg-red-50 text-red-600',
                            medium: 'bg-amber-50 text-amber-600',
                            low: 'bg-emerald-50 text-emerald-600',
                          }
                          const labels = { high: 'High', medium: 'Medium', low: 'Low' }
                          return (
                            <div key={severity} className={`flex-1 rounded-[1.2rem] py-3 text-center ${styles[severity]}`}>
                              <p className="text-xl font-bold">{value > 0 ? value : '—'}</p>
                              <p className="mt-0.5 text-[10px] font-semibold opacity-70">{labels[severity]}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="journal-frame p-6">
                <h2 className="section-label mb-5">Frequently Seen Rules</h2>

                {!jaStats.ruleTagTop || jaStats.ruleTagTop.length === 0 ? (
                  <EmptyState icon="🔎" message="아직 충분한 교정 데이터가 쌓이지 않았습니다." />
                ) : (
                  <div className="space-y-3">
                    {jaStats.ruleTagTop.slice(0, 5).map((rule, index) => {
                      const maxCount = jaStats.ruleTagTop[0]?.count ?? 1
                      const pct = Math.round((rule.count / maxCount) * 100)
                      return (
                        <div key={rule.ruleTag} className="group flex items-center gap-3">
                          <span className="w-5 shrink-0 text-center text-xs font-bold text-text-disabled transition-colors group-hover:text-primary-400">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="block truncate text-sm font-medium text-text-sub">
                              {RULE_TAG_LABEL[rule.ruleTag as RuleTag] ?? rule.ruleTag}
                            </span>
                            <div className="h-1.5 w-full rounded-full bg-surface-muted">
                              <div
                                className="h-full rounded-full bg-primary-400 transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-bold tabular-nums text-primary-600">{rule.count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="journal-frame p-6">
              <h2 className="section-label mb-1">Feedback Readiness</h2>
              <p className="mb-5 text-xs text-text-soft">로그와 rewrite 이력이 쌓이면 아래 분석이 열립니다.</p>
              <div className="space-y-3">
                {([
                  { icon: '✍', cond: 'rewrite 1회 이상', desc: '문제 변화 추세' },
                  { icon: '🧠', cond: '7일 이상 기록', desc: '주간 인사이트 힌트' },
                  { icon: '📚', cond: '여러 번의 교정 누적', desc: '자주 흔들리는 규칙 TOP' },
                ] as const).map((item) => (
                  <div
                    key={item.desc}
                    className="flex items-center gap-4 rounded-[1.2rem] border border-dashed border-border px-4 py-4 opacity-70"
                  >
                    <span className="shrink-0 text-2xl">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-main">{item.desc}</p>
                      <p className="mt-0.5 text-xs text-text-soft">{item.cond} 조건에서 열립니다.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary && (
            <div className="journal-frame p-6">
              <h2 className="section-label mb-4">Emotion Distribution</h2>
              <MoodDistribution moodCount={summary.moodCount} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-2.5 last:border-0">
      <span className="text-sm text-text-soft">{label}</span>
      <span
        className={clsx(
          'text-sm font-bold',
          highlight ? 'text-success-600' : value === '—' ? 'text-text-disabled' : 'text-text-main',
        )}
      >
        {value}
      </span>
    </div>
  )
}
