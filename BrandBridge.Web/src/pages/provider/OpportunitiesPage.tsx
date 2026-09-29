import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { OpportunityDto, ProviderDto } from '../../api/types'
import { ProviderStatus } from '../../api/types'
import { StatusChip } from '../../components/StatusChip'
import { money, providerStatusLabel } from '../../lib/labels'

export function OpportunitiesPage() {
  const [items, setItems] = useState<OpportunityDto[]>([])
  const [provider, setProvider] = useState<ProviderDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [page, me] = await Promise.all([api.listOpportunities(), api.getProvider()])
        if (!cancelled) {
          setItems(page.items)
          setProvider(me)
        }
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
          <h1>Opportunities</h1>
          <p className="muted">Open briefs matched to your verified profile.</p>
        </div>
        {provider && (
          <StatusChip
            label={providerStatusLabel[provider.status]}
            tone={provider.status === ProviderStatus.Verified ? 'teal' : 'amber'}
          />
        )}
      </div>
      {provider && provider.status !== ProviderStatus.Verified && (
        <div className="alert alert-ok">
          Complete your profile and wait for admin verification before proposals are accepted.
        </div>
      )}
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty panel">No open opportunities right now.</div>
      ) : (
        <div className="list">
          {items.map((item) => (
            <Link key={item.id} className="list-item" to={`/provider/opportunities/${item.id}/propose`}>
              <h3>{item.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {item.category} · {item.goal}
              </p>
              <div className="row muted">
                {(item.budgetMin != null || item.budgetMax != null) && (
                  <span>
                    {item.budgetMin != null ? money(item.budgetMin) : '—'} –{' '}
                    {item.budgetMax != null ? money(item.budgetMax) : '—'}
                  </span>
                )}
                {item.location && <span>{item.location}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
