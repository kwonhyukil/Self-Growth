import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { clearToken, setToken } from '../api/client'
import type { LoginBody, SignupBody } from '../types'

export const AUTH_KEY = ['auth', 'me'] as const

export function useMe() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: LoginBody) => authApi.login(body),
    onSuccess: (data) => {
      setToken(data.accessToken)
      qc.invalidateQueries({ queryKey: AUTH_KEY })
    },
  })
}

export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupBody) => authApi.signup(body),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return () => {
    clearToken()
    qc.clear()
  }
}
