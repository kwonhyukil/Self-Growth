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
type Days = typeof DAYS_OPTIONS[number]

// ── 빈 상태 ───────────────────────────────────────────────────
function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
      <span className="text-3xl opacity-30">{icon}</span>
      <p className="text-sm text-text-disabled leading-relaxed max-w-[200px]">{message}</p>
    </div>
  )
}

// ── 수치 포맷: 0 또는 null → "—" ─────────────────────────────
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-main">統計・日本語改善</h1>
        <p className="text-sm text-text-soft mt-0.5">あなたの学習パターンと進捗を確認</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* ── KPI カード ── */}
          {summary && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon="📝" label="合計ログ数" value={summary.totalLogs} />
              <StatCard icon="🔥" label="連続記録" value={`${summary.streak}日`} highlight />
              <StatCard icon="📅" label="直近7日" value={summary.last7DaysCount} sub="件" />
              <StatCard
                icon="💪"
                label="日本語改善"
                value={jaStats ? `${jaStats.totalRevisions}回` : '—'}
                sub="書き直し回数"
              />
            </div>
          )}

          {/* ── 기간 선택기 ── */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-soft font-medium">期間:</span>
            <div className="flex rounded-xl border border-border bg-surface-elevated p-1 gap-0.5 shadow-soft">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={clsx(
                    'rounded-lg px-4 py-1.5 text-sm font-semibold transition-all',
                    days === d ? 'bg-primary-600 text-white shadow-sm' : 'text-text-soft hover:bg-surface-subtle',
                  )}
                >
                  {d}日
                </button>
              ))}
            </div>
          </div>

          {/* ── 트렌드 차트 — two-column grid 위 ── */}
          {jaStats && jaStats.trend.length > 0 && (
            <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
              <h2 className="section-label mb-1">改善トレンド（{days}日）</h2>
              <p className="text-xs text-text-soft mb-4">書き直しによる問題数の変化</p>
              <TrendChart trend={jaStats.trend} />
            </div>
          )}

          {/* ── JA 개선 통계 ── */}
          {jaStats ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* 개선 요약 */}
              <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
                <h2 className="section-label mb-5">日本語改善サマリー（{days}日）</h2>

                {!hasRevisionData ? (
                  <EmptyState
                    icon="📊"
                    message={`まだ${days}日以内の書き直しデータがありません`}
                  />
                ) : (

                  <div className="space-y-1">
                    <Row label="書き直し回数" value={`${jaStats.totalRevisions}回`} />
                    <Row
                      label="合計改善問題数"
                      value={
                        jaStats.totalDeltaIssueCount < 0
                          ? `${Math.abs(jaStats.totalDeltaIssueCount)}件改善`
                          : fmtNum(jaStats.totalDeltaIssueCount, 0)
                      }
                      highlight={jaStats.totalDeltaIssueCount < 0}
                    />
                    <Row label="平均改善 / 回" value={fmtNum(jaStats.avgDeltaIssueCount)} />

                    <div className="pt-4">
                      <p className="text-xs text-text-disabled mb-2.5">重要度別分布</p>
                      <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map((s) => {
                          const n = jaStats.severityDistribution[s]
                          const styles = {
                            high:   'bg-red-50   text-red-600',
                            medium: 'bg-amber-50  text-amber-600',
                            low:    'bg-emerald-50 text-emerald-600',
                          }
                          const labels = { high: '重要', medium: '中程度', low: '軽微' }
                          return (
                            <div key={s} className={`flex-1 text-center rounded-xl py-3 ${styles[s]}`}>
                              <p className="text-xl font-bold">{n > 0 ? n : '—'}</p>
                              <p className="text-[10px] font-semibold mt-0.5 opacity-70">{labels[s]}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 자주 지적된 규칙 */}
              <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
                <h2 className="section-label mb-5">よく指摘されるルール</h2>

                {!jaStats.ruleTagTop || jaStats.ruleTagTop.length === 0 ? (
                  <EmptyState
                    icon="🔍"
                    message="書き直しをするとよく指摘されたルールがここに表示されます"
                  />
                ) : (
                  <div className="space-y-3">
                    {jaStats.ruleTagTop.slice(0, 5).map((r, i) => {
                      const maxCount = jaStats.ruleTagTop[0]?.count ?? 1
                      const pct = Math.round((r.count / maxCount) * 100)
                      return (
                        <div key={r.ruleTag} className="flex items-center gap-3 group">
                          <span className="w-5 text-center text-xs font-bold text-text-disabled group-hover:text-primary-400 transition-colors shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0 space-y-1">
                            <span className="text-sm text-text-sub font-medium block truncate">
                              {RULE_TAG_LABEL[r.ruleTag as RuleTag] ?? r.ruleTag}
                            </span>
                            <div className="h-1.5 w-full rounded-full bg-surface-muted">
                              <div
                                className="h-full rounded-full bg-primary-400 transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary-600 shrink-0 tabular-nums">{r.count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── 미래 예고형 잠금 카드 ── */
            <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
              <h2 className="section-label mb-1">日本語改善データ</h2>
              <p className="text-xs text-text-soft mb-5">ログを書き直すと、以下のデータが解放されます</p>
              <div className="space-y-3">
                {([
                  { icon: '📊', cond: '書き直し1回', desc: '感情の分布グラフ' },
                  { icon: '📈', cond: '7日以上の記録', desc: '感情の流れ（トレンド）' },
                  { icon: '🔍', cond: '3件以上の書き直し', desc: 'よく指摘されるルール TOP6' },
                ] as const).map((item) => (
                  <div
                    key={item.desc}
                    className="flex items-center gap-4 rounded-xl border border-dashed border-border p-4 opacity-60"
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-main">{item.desc}</p>
                      <p className="text-xs text-text-soft mt-0.5">{item.cond}が積まれると表示されます</p>
                    </div>
                    <span className="text-lg text-text-disabled shrink-0">🔒</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 기분 분포 ── */}
          {summary && (
            <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-activity">
              <h2 className="section-label mb-4">気分の分布</h2>
              <MoodDistribution moodCount={summary.moodCount} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────
function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
      <span className="text-sm text-text-soft">{label}</span>
      <span className={clsx(
        'text-sm font-bold',
        highlight    ? 'text-success-600' :
        value === '—'? 'text-text-disabled' : 'text-text-main'
      )}>
        {value}
      </span>
    </div>
  )
}
