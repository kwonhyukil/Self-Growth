import { useGrowth } from '@/features/growth/queries'
import { GrowthPartner } from './GrowthPartner'
import { RadarChart } from './RadarChart'
import { Spinner } from '@/shared/ui/Spinner'

export function GrowthWidget() {
  const { data: growth, isLoading, isError } = useGrowth()

  if (isLoading) {
    return (
      <div className="journal-frame flex h-44 items-center justify-center">
        <Spinner size="md" variant="levels" />
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
    { label: '어휘', value: growth.vocabulary, color: 'bg-primary-400' },
    { label: '문법', value: growth.grammarAccuracy, color: 'bg-secondary-400' },
    { label: '기록', value: growth.consistency, color: 'bg-info-400' },
    { label: '감정', value: growth.positivity, color: 'bg-success-400' },
    { label: '교정', value: growth.revisionEffort, color: 'bg-warning-400' },
    { label: '통찰', value: growth.verbalizationClarity ?? 0, color: 'bg-accent-400' },
  ]

  return (
    <div className="journal-frame overflow-hidden">
      <div className="border-b border-white/60 px-6 pb-5 pt-6">
        <p className="agent-pill">Growth Companion</p>
        <h2 className="mt-4 text-h2">Your learning companion</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-soft">
          기록, 교정, 언어화 흐름을 바탕으로 현재의 성장 균형을 한 눈에 보여줍니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="flex w-full shrink-0 justify-center border-b border-white/60 px-8 py-8 md:w-64 md:border-b-0 md:border-r">
          <GrowthPartner level={growth.dogLevel} emotion={growth.dogEmotion} radarAvgScore={growth.radarAvgScore} />
        </div>

        <div className="min-w-0 flex-1 px-6 py-6">
          <div className="rounded-[1.8rem] border border-white/70 bg-white/55 px-4 py-5 shadow-soft">
            <div className="flex flex-col items-center gap-3">
              <div style={{ padding: '0 32px' }} className="flex w-full justify-center overflow-visible">
                <RadarChart data={radarData} size={220} />
              </div>
              <p className="text-center text-caption text-text-soft">
                여섯 축의 균형을 보며 어떤 영역을 더 다듬을지 확인하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 border-t border-white/60 px-6 pb-6 pt-5 md:grid-cols-6">
        {axes.map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-[1.2rem] border border-white/60 bg-white/45 px-3 py-3">
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
