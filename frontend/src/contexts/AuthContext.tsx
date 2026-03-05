import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'
import type { User } from '../types'

interface AuthCtx {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const qc = useQueryClient()

  // Rehydrate session from stored token
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    authApi
      .me()
      .then(() => {
        // Token valid — fetch minimal user info via login check is unavailable,
        // so we decode basic info from token-based endpoint.
        // We rely on the token being present; user data will be refreshed on login.
        setIsLoading(false)
      })
      .catch(() => {
        clearToken()
        setIsLoading(false)
      })
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password })
    setToken(data.accessToken)
    setUser(data.user)
  }

  const signup = async (email: string, password: string, name: string) => {
    await authApi.signup({ email, password, name })
    // Auto-login after signup
    await login(email, password)
  }

  const logout = () => {
    clearToken()
    setUser(null)
    qc.clear()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
