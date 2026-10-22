import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { errorMessage } from '../api/client'

interface ToastItem {
  id: number
  tone: 'success' | 'error'
  text: string
}

interface ToastApi {
  success: (text: string) => void
  error: (error: unknown) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((tone: ToastItem['tone'], text: string) => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, tone, text }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4500)
  }, [])

  const api: ToastApi = {
    success: (text) => push('success', text),
    error: (error) => push('error', errorMessage(error)),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
