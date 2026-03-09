import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { verbalizationApi } from './api'

const key = (logId: number) => ['verbalization', logId]

export function useVerbalization(logId: number) {
  return useQuery({
    queryKey: key(logId),
    queryFn: () => verbalizationApi.getSession(logId),
    staleTime: 30_000,
  })
}

export function useStartBrainstorm(logId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      rawThoughts,
      thinkingDurationMs,
    }: {
      rawThoughts: string
      thinkingDurationMs?: number
    }) => verbalizationApi.startBrainstorm(logId, rawThoughts, thinkingDurationMs),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(logId) })
    },
  })
}

export function useSubmitProbeAnswer(logId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (probingAnswer: string) =>
      verbalizationApi.submitProbeAnswer(logId, probingAnswer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(logId) })
      qc.invalidateQueries({ queryKey: ['growth'] })
    },
  })
}
