import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { api, getToken, setToken } from '../api/client'
import type { AuthResponse, MeResponse, UserRole } from '../api/types'
import { roleHome } from '../lib/labels'

interface AuthState {
  token: string | null
  user: MeResponse | null
  loading: boolean
  login: (email: string, password: string) => Promise<string>
  register: (input: {
    email: string
    password: string
    displayName: string
    role: UserRole
  }) => Promise<string>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function hydrateFromAuth(auth: AuthResponse): Promise<MeResponse> {
  setToken(auth.accessToken)
  return api.me()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    const current = getToken()
    if (!current) {
      setUser(null)
      setTokenState(null)
      return
    }
    const me = await api.me()
    setUser(me)
    setTokenState(current)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (getToken()) {
          const me = await api.me()
          if (!cancelled) setUser(me)
        }
      } catch {
        setToken(null)
        if (!cancelled) {
          setUser(null)
          setTokenState(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const auth = await api.login({ email, password })
    const me = await hydrateFromAuth(auth)
    setUser(me)
    setTokenState(auth.accessToken)
    return roleHome(me.role)
  }, [])

  const register = useCallback(
    async (input: {
      email: string
      password: string
      displayName: string
      role: UserRole
    }) => {
      const auth = await api.register(input)
      const me = await hydrateFromAuth(auth)
      setUser(me)
      setTokenState(auth.accessToken)
      return roleHome(me.role)
    },
    [],
  )

  const logout = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, refreshMe }),
    [token, user, loading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
