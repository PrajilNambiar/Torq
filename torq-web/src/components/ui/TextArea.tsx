import { useId, type TextareaHTMLAttributes } from 'react'
import { Field } from './Field'

export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  error?: string
}

/** Controlled multiline text area. Spans full form-grid width by default. */
export function TextArea({
  label,
  value,
  onChange,
  hint,
  error,
  id,
  required,
  className,
  rows = 3,
  ...rest
}: TextAreaProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} required={required} className="field--wide">
      <textarea
        id={inputId}
        className={`control ${className ?? ''}`.trim()}
        value={value}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </Field>
  )
}
