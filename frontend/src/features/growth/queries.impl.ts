import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { growthApi } from './api'

export const GROWTH_KEY = ['growth'] as const

export function useGrowth() {
  return useQuery({
    queryKey: GROWTH_KEY,
    queryFn: growthApi.getSnapshot,
    staleTime: 30_000,
  })
}

/** 로그/리비전 저장 후 성장 스냅샷 강제 갱신 */
export function useRefreshGrowth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: growthApi.refresh,
    onSuccess: (data) => {
      qc.setQueryData(GROWTH_KEY, data)
    },
  })
}
