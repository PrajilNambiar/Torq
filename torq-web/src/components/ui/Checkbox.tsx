import { useId } from 'react'

export type CheckboxProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
  disabled?: boolean
  className?: string
}

/** Controlled checkbox with inline label. */
export function Checkbox({ label, checked, onChange, hint, disabled, className }: CheckboxProps) {
  const id = useId()

  return (
    <div className={`checkbox-field ${className ?? ''}`.trim()}>
      <label className="checkbox-label" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className="control-checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}
