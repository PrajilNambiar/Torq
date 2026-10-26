import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Field } from './Field'

export type TextBoxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  error?: string
  wide?: boolean
  leadingIcon?: ReactNode
  /** When type is password, show an eye toggle by default. Pass false to hide. */
  revealPassword?: boolean
}

/** Controlled single-line text / email / password / number / url input. */
export function TextBox({
  label,
  value,
  onChange,
  hint,
  error,
  wide,
  id,
  required,
  className,
  type = 'text',
  leadingIcon,
  revealPassword,
  ...rest
}: TextBoxProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const showReveal = isPassword && revealPassword !== false
  const inputType = isPassword && visible ? 'text' : type
  const hasAddon = Boolean(leadingIcon || showReveal)

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      htmlFor={inputId}
      required={required}
      className={wide ? 'field--wide' : undefined}
    >
      <div className={`control-wrap ${hasAddon ? 'has-addon' : ''} ${leadingIcon ? 'has-leading' : ''} ${showReveal ? 'has-trailing' : ''}`.trim()}>
        {leadingIcon && <span className="control-leading">{leadingIcon}</span>}
        <input
          id={inputId}
          className={`control ${className ?? ''}`.trim()}
          type={inputType}
          value={value}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
        {showReveal && (
          <button
            type="button"
            className="control-trailing"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </Field>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" strokeLinecap="round" />
      <path d="M9.5 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.2 4.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.1 6.1A18 18 0 0 0 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.9-.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
