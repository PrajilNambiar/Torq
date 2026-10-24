import { useId } from 'react'
import { Field } from './Field'

export type DateFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  error?: string
  required?: boolean
  min?: string
  max?: string
  disabled?: boolean
  className?: string
}

/** Controlled date input. */
export function DateField({
  label,
  value,
  onChange,
  hint,
  error,
  required,
  min,
  max,
  disabled,
  className,
}: DateFieldProps) {
  const id = useId()

  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} required={required} className={className}>
      <input
        id={id}
        className="control"
        type="date"
        value={value}
        required={required}
        min={min}
        max={max}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}
