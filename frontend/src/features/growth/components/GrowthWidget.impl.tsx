import { useGrowth } from '@/features/growth/queries'
import { GrowthPartner } from './GrowthPartner'
import { RadarChart } from './RadarChart'
import { Spinner } from '@/shared/ui/Spinner'

export function GrowthWidget() {
  const { data: growth, isLoading, isError } = useGrowth()

  if (isLoading) {
    return (
      <div className="dashboard-panel flex h-40 items-center justify-center">
        <Spinner size="md" />
      </div>
    )
  }

  if (isError || !growth) return null

  const radarData = {
    vocabulary: growth.vocabulary,
    grammarAccuracy: growth.grammarAccuracy,
    consistency: growth.consistency,
    positivity: growth.positivity,
    revisionEffort: growth.revisionEffort,
    verbalizationClarity: growth.verbalizationClarity ?? 0,
  }

  const axes = [
    { label: '語彙',    value: growth.vocabulary,               color: 'bg-primary-400'   },
    { label: '文法',    value: growth.grammarAccuracy,           color: 'bg-secondary-400' },
    { label: '継続',    value: growth.consistency,               color: 'bg-info-400'      },
    { label: '前向きさ', value: growth.positivity,               color: 'bg-success-400'   },
    { label: '書き直し', value: growth.revisionEffort,           color: 'bg-warning-400'   },
    { label: '明確さ',  value: growth.verbalizationClarity ?? 0, color: 'bg-accent-400'    },
  ]

  return (
    <div className="dashboard-panel overflow-hidden">
      <div className="border-b border-border-subtle px-6 pb-4 pt-6">
        <h2 className="section-label">成長スナップショット</h2>
        <p className="mt-1 text-caption text-text-soft">成長パートナーとスキルバランスを確認しましょう</p>
      </div>

      <div className="flex flex-col items-center gap-0 divide-y divide-border-subtle md:flex-row md:divide-x md:divide-y-0">
        <div className="flex w-full shrink-0 justify-center px-8 py-6 md:w-56">
          <GrowthPartner level={growth.dogLevel} emotion={growth.dogEmotion} radarAvgScore={growth.radarAvgScore} />
        </div>

        <div className="min-w-0 flex-1 px-6 py-6">
          <div className="rounded-panel border border-border-subtle bg-surface-subtle px-4 py-5">
            <div className="flex flex-col items-center gap-3">
              <div style={{ padding: '0 32px' }} className="flex w-full justify-center overflow-visible">
                <RadarChart data={radarData} size={220} />
              </div>
              <p className="text-center text-caption text-text-soft">
                表現力・継続性・自己理解のバランスを可視化しています
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 border-t border-border-subtle px-6 pb-6 pt-5">
        {axes.map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-caption text-text-soft">{label}</span>
            <div className="progress-rail w-full">
              <div className={`progress-fill ${color}`} style={{ width: `${Math.max(2, value)}%` }} />
            </div>
            <span className="text-caption font-semibold text-text-sub tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
