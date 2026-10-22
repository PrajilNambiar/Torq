import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api'
import { setUnauthorizedHandler, tokenStore } from '../api/client'
import type { LoginRequest, MeResponse, RegisterRequest } from '../types/api'

interface AuthState {
  user: MeResponse | null
  loading: boolean
  login: (body: LoginRequest) => Promise<MeResponse>
  register: (body: RegisterRequest) => Promise<MeResponse>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(() => tokenStore.get() !== null)

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    if (!tokenStore.get()) return
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const completeAuth = useCallback(async (accessToken: string) => {
    tokenStore.set(accessToken)
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      logout,
      login: async (body) => completeAuth((await authApi.login(body)).accessToken),
      register: async (body) => completeAuth((await authApi.register(body)).accessToken),
    }),
    [user, loading, logout, completeAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
