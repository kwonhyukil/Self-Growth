import api from './client'
import type { AuthResponse, LoginBody, SignupBody, User } from '../types'

export const authApi = {
  signup: async (body: SignupBody): Promise<{ user: User }> => {
    const res = await api.post<{ data: { user: User } }>('/auth/signup', body)
    return res.data.data
  },

  login: async (body: LoginBody): Promise<AuthResponse> => {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', body)
    return res.data.data
  },

  /** Lightweight auth check — returns userId */
  me: async (): Promise<{ userId: number }> => {
    const res = await api.get<{ data: { message: string; userId: number } }>('/logs/me')
    return { userId: res.data.data.userId }
  },
}
