import { Link } from 'react-router-dom'
import { useSummary, useDashboard } from '../hooks/useStats'
import { useLogs } from '../hooks/useLogs'
import { useAuthContext } from '../contexts/AuthContext'
import { StatCard } from '../components/stats/SummaryCards'
import { MoodDistribution } from '../components/stats/MoodDistribution'
import { LogCard } from '../components/logs/LogCard'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { RULE_TAG_LABEL } from '../utils/constants'
import type { RuleTag } from '../types'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuthContext()
  const { data: summary, isLoading: sumLoading } = useSummary()
  const { data: dashboard, isLoading: dashLoading } = useDashboard()
  const { data: logs } = useLogs()

  const isLoading = sumLoading || dashLoading

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            おかえりなさい{user?.name ? `、${user.name}さん` : ''}！ 🌱
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">今日も成長を記録しましょう</p>
        </div>
        <Link to="/logs">
          <Button leftIcon={<span>＋</span>}>新しいログ</Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && summary && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon="📝"
              label="合計ログ数"
              value={summary.totalLogs}
              highlight
            />
            <StatCard
              icon="📅"
              label="直近7日"
              value={summary.last7DaysCount}
              sub="件の記録"
            />
            <StatCard
              icon="🔥"
              label="連続記録"
              value={`${summary.streak}日`}
              highlight={summary.streak >= 3}
            />
            <StatCard
              icon="🌟"
              label="最多気分"
              value={Object.entries(summary.moodCount)
                .sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—'}
            />
          </div>

          {/* Coach insight */}
          {dashboard?.coach?.week && (
            <Section title="今週のコーチングアドバイス">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">🎯</span>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">
                      フォーカスポイント:{' '}
                      <span className="font-semibold text-brand-700">
                        {RULE_TAG_LABEL[dashboard.coach.week.focusRuleTag as RuleTag] ?? dashboard.coach.week.focusRuleTag}
                      </span>
                    </p>
                    <p className="text-sm text-slate-700">{dashboard.coach.week.why}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-brand-50 border border-brand-100 px-4 py-3">
                  <p className="text-xs font-semibold text-brand-700 mb-1">今週のアクション</p>
                  <p className="text-sm text-brand-800">{dashboard.coach.week.oneAction}</p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">自己チェック質問</p>
                  <p className="text-sm text-slate-700 italic">&ldquo;{dashboard.coach.week.nextQuestion}&rdquo;</p>
                </div>
              </div>
            </Section>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Mood distribution */}
            <Section title="気分の分布">
              <MoodDistribution moodCount={summary.moodCount} />
            </Section>

            {/* Next focus areas */}
            {dashboard?.insights?.nextTargets && dashboard.insights.nextTargets.length > 0 && (
              <Section title="次の改善ターゲット">
                <div className="space-y-2">
                  {dashboard.insights.nextTargets.slice(0, 4).map((t, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                    >
                      <span className="text-brand-600 font-bold text-sm shrink-0">#{i + 1}</span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {RULE_TAG_LABEL[t.ruleTag as RuleTag] ?? t.ruleTag}
                        </p>
                        <p className="text-xs text-slate-500">{t.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Recent logs */}
          {logs && logs.length > 0 && (
            <Section title="最近のログ">
              <div className="space-y-3">
                {logs.slice(0, 3).map((log) => (
                  <LogCard key={log.id} log={log} />
                ))}
              </div>
              {logs.length > 3 && (
                <div className="mt-4 text-center">
                  <Link to="/logs" className="text-sm text-brand-600 hover:underline">
                    すべてのログを見る ({logs.length}件) →
                  </Link>
                </div>
              )}
            </Section>
          )}
        </>
      )}
    </div>
  )
}
