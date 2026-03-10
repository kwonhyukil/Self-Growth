import api from '@/shared/api/client'
import type { AuthResponse, LoginBody, SignupBody, User } from '@/types'

export const authApi = {
  signup: async (body: SignupBody): Promise<{ user: User }> => {
    const res = await api.post<{ data: { user: User } }>('/auth/signup', body)
    return res.data.data
  },

  login: async (body: LoginBody): Promise<AuthResponse> => {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', body)
    return res.data.data
  },

  me: async (): Promise<{ user: User }> => {
    const res = await api.get<{ data: { user: User } }>('/auth/me')
    return res.data.data
  },
}
