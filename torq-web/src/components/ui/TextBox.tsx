import { useId, type InputHTMLAttributes } from 'react'
import { Field } from './Field'

export type TextBoxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  error?: string
  wide?: boolean
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
  ...rest
}: TextBoxProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      htmlFor={inputId}
      required={required}
      className={wide ? 'field--wide' : undefined}
    >
      <input
        id={inputId}
        className={`control ${className ?? ''}`.trim()}
        type={type}
        value={value}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </Field>
  )
}
