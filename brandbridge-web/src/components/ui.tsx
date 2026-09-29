import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api/client'

export function Spinner({ full }: { full?: boolean }) {
  return (
    <div className={full ? 'spinner-wrap full' : 'spinner-wrap'} role="status" aria-label="Loading">
      <span className="spinner" />
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  back?: string
}) {
  return (
    <header className="page-header">
      <div>
        <h1>
          {back && (
            <Link to={back} className="back" aria-label="Back">
              ←
            </Link>
          )}
          {title}
        </h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </header>
  )
}

export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className ?? ''}`}>
      {(title || actions) && (
        <div className="card-head">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null
  return <div className="alert error">{errorMessage(error)}</div>
}

export function Alert({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'success' | 'error'; children: ReactNode }) {
  return <div className={`alert ${tone}`}>{children}</div>
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function DefinitionList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="dl">
      {items
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
    </dl>
  )
}

export function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="pager">
      <button className="btn ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span className="muted">
        Page {page} of {pages}
      </span>
      <button className="btn ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  )
}
