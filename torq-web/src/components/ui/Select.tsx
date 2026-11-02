import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Field } from './Field'

export type SelectOption<T extends string | number = string> = {
  value: T
  label: string
  description?: string
  icon?: ReactNode
  disabled?: boolean
}

export type SelectProps<T extends string | number = string> = {
  label: string
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  hint?: string
  error?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

/** Custom styled select — replaces native browser dropdowns. */
export function Select<T extends string | number = string>({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  required,
  placeholder = 'Select…',
  disabled,
  className,
}: SelectProps<T>) {
  const id = useId()
  const listId = `${id}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function pick(next: T) {
    onChange(next)
    setOpen(false)
  }

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
  }

  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} required={required} className={className}>
      <div className={`select ${open ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`.trim()} ref={rootRef}>
        <button
          id={id}
          type="button"
          className="select-trigger control"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={Boolean(error) || undefined}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onTriggerKey}
        >
          <span className="select-value">
            {selected?.icon && <span className="select-option-icon">{selected.icon}</span>}
            <span className={selected ? '' : 'select-placeholder'}>{selected?.label ?? placeholder}</span>
          </span>
          <svg className="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <ul id={listId} className="select-menu" role="listbox" aria-labelledby={id}>
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <li key={String(opt.value)} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    className={`select-option ${isSelected ? 'is-selected' : ''}`.trim()}
                    onClick={() => pick(opt.value)}
                  >
                    {opt.icon && <span className="select-option-icon">{opt.icon}</span>}
                    <span className="select-option-copy">
                      <span className="select-option-label">{opt.label}</span>
                      {opt.description && <span className="select-option-desc">{opt.description}</span>}
                    </span>
                    {isSelected && (
                      <svg className="select-check" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="m5 12 5 5L20 7"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Field>
  )
}
