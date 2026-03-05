import axios, { AxiosError } from 'axios'
import type { ApiError } from '../types'

const TOKEN_KEY = 'sg_access_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

/** Typed AppError thrown by the response interceptor */
export class AppError extends Error {
  code: string
  status: number
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: unwrap data / map AppError ─────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiError>) => {
    const status = err.response?.status ?? 0
    const body = err.response?.data

    // If the server returned our error shape, map it to AppError
    if (body?.error) {
      const { code, message, details } = body.error
      // 401 → clear stale token so auth context can redirect
      if (status === 401) clearToken()
      return Promise.reject(new AppError(status, code, message, details))
    }

    // Network / timeout errors
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
      return Promise.reject(
        new AppError(0, 'NETWORK_ERROR', 'サーバーに接続できません。'),
      )
    }

    return Promise.reject(err)
  },
)

export default api
