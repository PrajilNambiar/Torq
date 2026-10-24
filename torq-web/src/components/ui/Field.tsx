import type { ReactNode } from 'react'

export type FieldProps = {
  label: string
  hint?: string
  error?: string
  htmlFor?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/** Shared label / hint / error chrome for all form controls. */
export function Field({ label, hint, error, htmlFor, required, className, children }: FieldProps) {
  return (
    <div className={`field ${className ?? ''}`.trim()}>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="field-required" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
