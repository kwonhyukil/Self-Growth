import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logsApi } from '../api/logs'
import type { CreateLogBody, UpdateLogBody } from '../types'

export const LOGS_KEY = ['logs'] as const
export const logKey = (id: number) => ['logs', id] as const

export function useLogs() {
  return useQuery({
    queryKey: LOGS_KEY,
    queryFn: logsApi.list,
    staleTime: 60_000,
  })
}

export function useLog(id: number) {
  return useQuery({
    queryKey: logKey(id),
    queryFn: () => logsApi.get(id),
    enabled: id > 0,
    staleTime: 60_000,
  })
}

export function useCreateLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateLogBody) => logsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOGS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateLog(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateLogBody) => logsApi.update(id, body),
    onSuccess: (updated) => {
      qc.setQueryData(logKey(id), updated)
      qc.invalidateQueries({ queryKey: LOGS_KEY })
    },
  })
}

export function useDeleteLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => logsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOGS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
