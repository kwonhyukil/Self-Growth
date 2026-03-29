import { Spinner } from '@/shared/ui/Spinner'
import { useAuthContext } from '@/features/auth/auth-provider'
import { useLogs } from '@/features/logs/queries'
import { useDashboard, useSummary } from '@/features/stats/queries'
import {
  DashboardContent,
  DashboardHero,
  OnboardingCard,
} from '@/features/stats/components/DashboardSections'
import type { MoodTag } from '@/types'

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
      <DashboardHero user={user} hasLogs={hasLogs} summary={summary} topMood={topMood} />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6 animate-fade-in">
          {!hasLogs && <OnboardingCard />}
          {hasLogs && summary && dashboard && (
            <DashboardContent summary={summary} dashboard={dashboard} logs={logs ?? []} />
          )}
        </div>
      )}
    </div>
  )
}
