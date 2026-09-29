import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { CampaignDto } from '../../api/types'
import { StatusChip } from '../../components/StatusChip'
import { campaignStatusLabel, money } from '../../lib/labels'
import { useAuth } from '../../auth/AuthContext'
import { UserRole } from '../../api/types'

export function CampaignsPage() {
  const { user } = useAuth()
  const base = user?.role === UserRole.Provider ? '/provider/campaigns' : '/business/campaigns'
  const [items, setItems] = useState<CampaignDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const page = await api.listCampaigns()
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
          <h1>Campaigns</h1>
          <p className="muted">Funded workspaces for messaging, milestones, and payouts.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty panel">No campaigns yet.</div>
      ) : (
        <div className="list">
          {items.map((c) => (
            <Link key={c.id} className="list-item" to={`${base}/${c.id}`}>
              <div className="row">
                <h3>Campaign {c.id.slice(0, 8)}</h3>
                <StatusChip label={campaignStatusLabel[c.status]} tone="teal" />
              </div>
              <div className="row muted">
                <span>{money(c.agreedPrice, c.currency)}</span>
                <span>Fee {money(c.platformFeeAmount, c.currency)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
