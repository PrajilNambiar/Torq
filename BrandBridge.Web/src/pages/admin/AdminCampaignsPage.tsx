import { useEffect, useState } from 'react'
import { api, ApiError } from '../../api/client'
import type { CampaignDto } from '../../api/types'
import { StatusChip } from '../../components/StatusChip'
import { campaignStatusLabel, money } from '../../lib/labels'

export function AdminCampaignsPage() {
  const [items, setItems] = useState<CampaignDto[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const page = await api.adminCampaigns()
        if (!cancelled) setItems(page.items)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load')
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
          <h1>All campaigns</h1>
          <p className="muted">Marketplace oversight.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {items.length === 0 ? (
        <div className="empty panel">No campaigns.</div>
      ) : (
        <div className="list">
          {items.map((c) => (
            <div key={c.id} className="list-item">
              <div className="row">
                <h3>{c.id.slice(0, 8)}</h3>
                <StatusChip label={campaignStatusLabel[c.status]} />
              </div>
              <div className="row muted">
                <span>{money(c.agreedPrice, c.currency)}</span>
                <span>Fee {money(c.platformFeeAmount, c.currency)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
