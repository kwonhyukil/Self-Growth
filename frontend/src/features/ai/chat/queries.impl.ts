import { useMutation } from '@tanstack/react-query'
import { chatAgentApi } from './api'
import type { ChatAgentInput } from '@/types'

export function useChatAgent() {
  return useMutation({
    mutationFn: (body: ChatAgentInput) => chatAgentApi.reply(body),
  })
}
