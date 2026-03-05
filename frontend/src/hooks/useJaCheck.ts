import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jaCheckApi } from '../api/jaCheck'

export const jaLatestKey = (logId: number) => ['ja', 'latest', logId] as const
export const jaResultsKey = (logId: number) => ['ja', 'results', logId] as const
export const jaRevKey = (logId: number) => ['ja', 'revisions', logId] as const
export const jaRevDetailKey = (revId: number) => ['ja', 'revision', revId] as const

export function useJaLatest(logId: number) {
  return useQuery({
    queryKey: jaLatestKey(logId),
    queryFn: () => jaCheckApi.getLatest(logId),
    enabled: logId > 0,
    staleTime: 30_000,
  })
}

export function useJaResults(logId: number) {
  return useQuery({
    queryKey: jaResultsKey(logId),
    queryFn: () => jaCheckApi.listResults(logId),
    enabled: logId > 0,
  })
}

export function useRunJaCheck(logId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => jaCheckApi.run(logId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jaLatestKey(logId) })
      qc.invalidateQueries({ queryKey: jaResultsKey(logId) })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useJaRevisions(logId: number) {
  return useQuery({
    queryKey: jaRevKey(logId),
    queryFn: () => jaCheckApi.listRevisions(logId),
    enabled: logId > 0,
  })
}

export function useJaRevisionDetail(revisionId: number) {
  return useQuery({
    queryKey: jaRevDetailKey(revisionId),
    queryFn: () => jaCheckApi.getRevision(revisionId),
    enabled: revisionId > 0,
  })
}

export function useRewriteJa(logId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (revisedText: string) => jaCheckApi.rewrite(logId, revisedText),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: jaLatestKey(logId) })
      qc.invalidateQueries({ queryKey: jaResultsKey(logId) })
      qc.invalidateQueries({ queryKey: jaRevKey(logId) })
      qc.invalidateQueries({ queryKey: jaRevDetailKey(data.revisionId) })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
