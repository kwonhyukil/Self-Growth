import { useState } from 'react'
import { useSummary, useJaImprovement } from '../hooks/useStats'
import { StatCard } from '../components/stats/SummaryCards'
import { MoodDistribution } from '../components/stats/MoodDistribution'
import { TrendChart } from '../components/stats/TrendChart'
import { Spinner } from '../components/ui/Spinner'
import { RULE_TAG_LABEL } from '../utils/constants'
import type { RuleTag } from '../types'
import { clsx } from 'clsx'

const DAYS_OPTIONS = [7, 30, 90] as const
type Days = typeof DAYS_OPTIONS[number]

export function StatsPage() {
  const [days, setDays] = useState<Days>(30)
  const { data: summary, isLoading: sumLoading } = useSummary()
  const { data: jaStats, isLoading: jaLoading } = useJaImprovement(days)

  const isLoading = sumLoading || jaLoading

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">統計・日本語改善</h1>
        <p className="text-sm text-slate-500 mt-0.5">あなたの学習パターンと進捗を確認</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Overall stats */}
          {summary && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon="📝" label="合計ログ数" value={summary.totalLogs} />
              <StatCard icon="🔥" label="連続記録" value={`${summary.streak}日`} highlight={summary.streak >= 3} />
              <StatCard icon="📅" label="直近7日" value={summary.last7DaysCount} sub="件" />
              <StatCard
                icon="💪"
                label="日本語改善"
                value={jaStats ? `${jaStats.totalRevisions}回` : '—'}
                sub="書き直し回数"
              />
            </div>
          )}

          {/* Period selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">期間:</span>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 gap-0.5">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={clsx(
                    'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                    days === d
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {d}日
                </button>
              ))}
            </div>
          </div>

          {/* JA improvement stats */}
          {jaStats && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Summary */}
              <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                  日本語改善サマリー（{days}日）
                </h2>
                <div className="space-y-3">
                  <Row label="書き直し回数" value={`${jaStats.totalRevisions}回`} />
                  <Row
                    label="合計改善問題数"
                    value={jaStats.totalDeltaIssueCount < 0 ? `${Math.abs(jaStats.totalDeltaIssueCount)}件改善` : `${jaStats.totalDeltaIssueCount}件`}
                    highlight={jaStats.totalDeltaIssueCount < 0}
                  />
                  <Row
                    label="平均改善/回"
                    value={jaStats.avgDeltaIssueCount.toFixed(1)}
                  />

                  {/* Severity distribution */}
                  <div className="pt-2">
                    <p className="text-xs text-slate-400 mb-2">重要度別分布</p>
                    <div className="flex gap-2">
                      {(['high', 'medium', 'low'] as const).map((s) => (
                        <div key={s} className="flex-1 text-center rounded-lg bg-slate-50 py-2">
                          <p className="text-lg font-bold text-slate-800">{jaStats.severityDistribution[s]}</p>
                          <p className="text-xs text-slate-400">
                            {s === 'high' ? '重要' : s === 'medium' ? '中程度' : '軽微'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top rule tags */}
              <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                  よく指摘されるルール
                </h2>
                <div className="space-y-2">
                  {jaStats.ruleTagTop.slice(0, 6).map((r, i) => (
                    <div key={r.ruleTag} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                      <span className="flex-1 text-sm text-slate-700">
                        {RULE_TAG_LABEL[r.ruleTag as RuleTag] ?? r.ruleTag}
                      </span>
                      <span className="text-sm font-semibold text-brand-700">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trend chart */}
          {jaStats && jaStats.trend.length > 0 && (
            <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                改善トレンド（{days}日）
              </h2>
              <TrendChart trend={jaStats.trend} />
            </div>
          )}

          {/* Mood distribution */}
          {summary && (
            <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                気分の分布
              </h2>
              <MoodDistribution moodCount={summary.moodCount} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-emerald-600' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  )
}
