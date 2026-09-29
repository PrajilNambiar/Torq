import axios, { AxiosError } from 'axios'

const TOKEN_KEY = 'bb.token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5081/api/v1',
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLogin) {
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)

// Select, fund and payout are idempotent on the server when this header is present.
export function idempotent() {
  return { headers: { 'Idempotency-Key': crypto.randomUUID() } }
}

interface ProblemBody {
  error?: string
  title?: string
  errors?: Record<string, string[]>
}

export function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const body = error.response?.data as ProblemBody | undefined
    if (status === 429) return 'Too many requests. Please wait a minute and try again.'
    if (body?.error) return body.error
    if (body?.errors) return Object.values(body.errors).flat().join(' ')
    if (body?.title) return body.title
    if (!error.response) return 'Cannot reach the BrandBridge API. Is it running on port 5081?'
    return `Request failed (${status}).`
  }
  return error instanceof Error ? error.message : 'Something went wrong.'
}
