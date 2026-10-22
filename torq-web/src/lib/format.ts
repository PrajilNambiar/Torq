export function money(amount: number | null | undefined, currency = 'INR') {
  if (amount === null || amount === undefined) return '—'
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function budget(min: number | null, max: number | null, currency = 'INR') {
  if (min === null && max === null) return 'Open budget'
  if (min !== null && max !== null) return `${money(min, currency)} – ${money(max, currency)}`
  return min !== null ? `From ${money(min, currency)}` : `Up to ${money(max, currency)}`
}

export function date(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function dateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function shortId(id: string) {
  return id.slice(0, 8)
}

/** Converts an empty form string to null and numeric strings to numbers. */
export function num(value: string): number | null {
  if (value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function blank(value: string): string | null {
  return value.trim() === '' ? null : value.trim()
}
