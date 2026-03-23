import api from '@/shared/api/client'
import type { ChatAgentInput, ChatAgentResponse } from '@/types'

export const chatAgentApi = {
  reply: async (body: ChatAgentInput): Promise<ChatAgentResponse> => {
    const res = await api.post<{ data: ChatAgentResponse }>('/ai/chat', body)
    return res.data.data
  },
}
