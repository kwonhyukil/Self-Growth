import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/stats'

const STATS = ['stats'] as const

export function useSummary() {
  return useQuery({
    queryKey: [...STATS, 'summary'],
    queryFn: statsApi.summary,
    staleTime: 60_000,
  })
}

export function useDashboard() {
  return useQuery({
    queryKey: [...STATS, 'dashboard'],
    queryFn: statsApi.dashboard,
    staleTime: 60_000,
  })
}

export function useJaImprovement(days = 30) {
  return useQuery({
    queryKey: [...STATS, 'ja-improvement', days],
    queryFn: () => statsApi.jaImprovement(days),
    staleTime: 60_000,
  })
}
