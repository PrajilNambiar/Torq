import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { RequirementDto } from '../../api/types'
import { StatusChip } from '../../components/StatusChip'
import { money, requirementStatusLabel } from '../../lib/labels'
import { RequirementStatus } from '../../api/types'

function toneFor(status: RequirementStatus) {
  if (status === RequirementStatus.Open || status === RequirementStatus.ProposalReview)
    return 'teal' as const
  if (status === RequirementStatus.UnderReview || status === RequirementStatus.Draft)
    return 'amber' as const
  if (status === RequirementStatus.Cancelled) return 'danger' as const
  return 'default' as const
}

export function RequirementsPage() {
  const [items, setItems] = useState<RequirementDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const page = await api.listRequirements()
        if (!cancelled) setItems(page.items)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <h1>Requirements</h1>
          <p className="muted">Draft briefs, submit for review, then compare proposals.</p>
        </div>
        <Link className="btn btn-primary" to="/business/requirements/new">
          New brief
        </Link>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty panel">No requirements yet. Create your first brief.</div>
      ) : (
        <div className="list">
          {items.map((item) => (
            <Link key={item.id} className="list-item" to={`/business/requirements/${item.id}`}>
              <div className="row">
                <h3>{item.title}</h3>
                <StatusChip
                  label={requirementStatusLabel[item.status]}
                  tone={toneFor(item.status)}
                />
              </div>
              <p className="muted" style={{ margin: 0 }}>
                {item.category} · {item.goal}
              </p>
              <div className="row muted">
                {(item.budgetMin != null || item.budgetMax != null) && (
                  <span>
                    Budget{' '}
                    {item.budgetMin != null ? money(item.budgetMin, item.currency) : '—'} –{' '}
                    {item.budgetMax != null ? money(item.budgetMax, item.currency) : '—'}
                  </span>
                )}
                {item.timelineDays != null && <span>{item.timelineDays} days</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
