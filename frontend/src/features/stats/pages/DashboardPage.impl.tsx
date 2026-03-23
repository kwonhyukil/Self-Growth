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

/** 온보딩 — 첫 방문자 (0 logs) */
function OnboardingCard() {
  const ACTIONS = [
    {
      icon: '✍️',
      title: '今日のログを書く',
      desc: '今日の出来事と感情を記録してみましょう',
      to: '/logs',
    },
    {
      icon: '🌸',
      title: '感情を日本語で表現',
      desc: '自分を褒める言葉をAIと一緒に考えます',
      to: '/logs',
    },
    {
      icon: '📈',
      title: '成長を確認する',
      desc: '続けるほどスキルの伸びが見えてきます',
      to: '/stats',
    },
  ]

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/30 p-8">
      <div className="text-center mb-7">
        <div className="text-4xl mb-3">🌱</div>
        <h2 className="text-lg font-bold text-text-main">はじめまして！成長の旅を始めましょう</h2>
        <p className="text-sm text-text-soft mt-1.5 leading-relaxed">
          最初のログを書くと成長パートナーが生まれ、レーダーチャートが育ち始めます。
        </p>
      </div>

      {/* 액션 카드 3개 */}
      <div className="grid gap-3 sm:grid-cols-3 mb-7">
        {ACTIONS.map((action) => (
          <Link
            key={action.title}
            to={action.to}
            className="rounded-xl bg-surface-elevated border border-border-subtle p-5 text-center shadow-soft
                       hover:-translate-y-0.5 hover:shadow-activity transition-all duration-150 cursor-pointer group"
          >
            <span className="text-3xl">{action.icon}</span>
            <p className="mt-3 text-sm font-bold text-text-main group-hover:text-primary-700 transition-colors">
              {action.title}
            </p>
            <p className="mt-1.5 text-xs text-text-soft leading-relaxed">{action.desc}</p>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link to="/logs">
          <Button leftIcon={<span>✍️</span>} size="lg" className="px-10">
            最初のログを書く
          </Button>
        </Link>
        <p className="mt-2 text-xs text-text-soft">3分あれば十分です</p>
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

  // 최빈 기분 계산
  const topMood = summary?.moodCount
    ? (Object.entries(summary.moodCount)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)[0]?.[0] as MoodTag | undefined)
    : undefined

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">
            {hasLogs
              ? `おかえりなさい${user?.name ? `、${user.name}さん` : ''}！ 🌱`
              : `ようこそ${user?.name ? `、${user.name}さん` : ''}！ 🌱`}
          </h1>
          <p className="text-sm text-text-disabled mt-0.5">
            {hasLogs ? '今日も成長を記録しましょう' : '成長の旅を始めましょう'}
          </p>

          {/* 개인화 스탯 스트립 — 로그 있을 때만 */}
          {hasLogs && summary && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {summary.streak >= 1 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-sub">
                  🔥 連続{summary.streak}日
                </span>
              )}
              {topMood && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-sub">
                  最近の気分：{MOOD_EMOJI[topMood]}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-subtle px-3 py-1 text-xs text-text-sub">
                ログ {summary.totalLogs}件
              </span>
            </div>
          )}
        </div>

        {hasLogs && (
          <Link to="/logs" className="shrink-0">
            <Button leftIcon={<span>✍️</span>}>新しいログ</Button>
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
          {/* ── 온보딩 ── */}
          {!hasLogs && <OnboardingCard />}

          {hasLogs && summary && (
            <>
              {/* ① 성장 파트너 + 레이더 차트 */}
              <GrowthWidget />

              {/* ② 코칭 어드바이스 */}
              {dashboard?.coach?.week && (
                <Section title="今週のコーチングアドバイス">
                  <div className="space-y-3">
                    {/* フォーカスポイント */}
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0">🎯</span>
                      <div>
                        <p className="text-[10px] font-semibold text-text-disabled uppercase tracking-widest mb-0.5">
                          フォーカスポイント
                        </p>
                        <p className="text-xs font-bold text-primary-600 mb-1">
                          {RULE_TAG_LABEL[dashboard.coach.week.focusRuleTag as RuleTag] ??
                            dashboard.coach.week.focusRuleTag}
                        </p>
                        <p className="text-sm text-text-sub leading-relaxed">{dashboard.coach.week.why}</p>
                      </div>
                    </div>

                    {/* 今週のアクション — 가장 강조 */}
                    <div className="rounded-xl bg-primary-50 border border-primary-200 px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500 mb-1.5">
                        今週のアクション
                      </p>
                      <p className="text-sm font-semibold text-primary-800 leading-relaxed">
                        {dashboard.coach.week.oneAction}
                      </p>
                    </div>

                    {/* セルフチェック質問 */}
                    <div className="rounded-xl bg-surface-subtle border border-border-subtle px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-disabled mb-1.5">
                        セルフチェック質問
                      </p>
                      <p className="text-sm text-text-sub italic leading-relaxed">
                        &ldquo;{dashboard.coach.week.nextQuestion}&rdquo;
                      </p>
                    </div>
                  </div>
                </Section>
              )}

              {/* ③ 최근 로그 — KPI 카드 위로 이동 */}
              <Section title="AI Coach">
                <CoachChatPanel />
              </Section>

              {logs && logs.length > 0 && (
                <Section title="最近のログ">
                  <div className="space-y-3">
                    {logs.slice(0, 3).map((log) => (
                      <LogCard key={log.id} log={log} />
                    ))}
                  </div>
                  {logs.length > 3 && (
                    <div className="mt-4 text-center">
                      <Link to="/logs" className="text-sm text-primary-500 font-medium hover:underline">
                        すべてのログを見る ({logs.length}件) →
                      </Link>
                    </div>
                  )}
                </Section>
              )}

              {/* ④ KPI 카드 */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon="📝" label="合計ログ数" value={summary.totalLogs} highlight />
                <StatCard icon="📅" label="直近7日"    value={summary.last7DaysCount} sub="件の記録" />
                <StatCard
                  icon="🔥"
                  label="連続記録"
                  value={`${summary.streak}日`}
                  highlight={summary.streak >= 3}
                />
                <StatCard
                  icon="🌟"
                  label="最多気分"
                  value={
                    Object.entries(summary.moodCount)
                      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—'
                  }
                />
              </div>

              {/* ⑤ 기분 분포 + 다음 타겟 */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Section title="気分の分布">
                  <MoodDistribution moodCount={summary.moodCount} />
                </Section>

                {dashboard?.insights?.nextTargets && dashboard.insights.nextTargets.length > 0 && (
                  <Section title="次の改善ターゲット">
                    <div className="space-y-2">
                      {dashboard.insights.nextTargets.slice(0, 4).map((t, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl bg-surface-subtle px-3 py-2.5 hover:bg-primary-50 transition-colors"
                        >
                          <span className="text-primary-500 font-bold text-sm shrink-0">#{i + 1}</span>
                          <div>
                            <p className="text-xs font-semibold text-text-sub">
                              {RULE_TAG_LABEL[t.ruleTag as RuleTag] ?? t.ruleTag}
                            </p>
                            <p className="text-xs text-text-disabled mt-0.5">{t.message}</p>
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
