import api from './client'
import type { CreateLogBody, GrowthLog, UpdateLogBody } from '../types'

export const logsApi = {
  list: async (): Promise<GrowthLog[]> => {
    const res = await api.get<{ data: { logs: GrowthLog[] } }>('/logs')
    return res.data.data.logs
  },

  get: async (id: number): Promise<GrowthLog> => {
    const res = await api.get<{ data: { log: GrowthLog } }>(`/logs/${id}`)
    return res.data.data.log
  },

  create: async (body: CreateLogBody): Promise<GrowthLog> => {
    const res = await api.post<{ data: { log: GrowthLog } }>('/logs', body)
    return res.data.data.log
  },

  update: async (id: number, body: UpdateLogBody): Promise<GrowthLog> => {
    const res = await api.patch<{ data: { log: GrowthLog } }>(`/logs/${id}`, body)
    return res.data.data.log
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/logs/${id}`)
  },
}
