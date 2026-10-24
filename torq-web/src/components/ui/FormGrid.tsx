import type { ReactNode } from 'react'

/** Two-column responsive form layout. Wide fields (textareas) span both columns. */
export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`form-grid ${className ?? ''}`.trim()}>{children}</div>
}
