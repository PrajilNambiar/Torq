import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../../api/client'
import type { DisputeDto, ProviderDto, RequirementDto } from '../../api/types'
import { StatusChip } from '../../components/StatusChip'
import { providerStatusLabel, requirementStatusLabel } from '../../lib/labels'

export function AdminHomePage() {
  const [requirements, setRequirements] = useState<RequirementDto[]>([])
  const [providers, setProviders] = useState<ProviderDto[]>([])
  const [disputes, setDisputes] = useState<DisputeDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [req, prov, disp] = await Promise.all([
      api.adminPendingRequirements(),
      api.adminPendingProviders(),
      api.adminDisputes(),
    ])
    setRequirements(req.items)
    setProviders(prov.items)
    setDisputes(disp.items)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load queues')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page stack-lg">
      <div className="section-head">
        <div>
          <h1>Admin queues</h1>
          <p className="muted">Open briefs, verify providers, resolve disputes.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}

      <section className="stack">
        <h2 style={{ margin: 0 }}>Requirements pending</h2>
        {requirements.length === 0 ? (
          <div className="empty panel">Queue clear.</div>
        ) : (
          <div className="list">
            {requirements.map((r) => (
              <div key={r.id} className="list-item">
                <div className="row">
                  <h3>{r.title}</h3>
                  <StatusChip label={requirementStatusLabel[r.status]} tone="amber" />
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {r.category} · {r.goal}
                </p>
                <div className="row">
                  <button
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() => run(() => api.adminOpenRequirement(r.id))}
                  >
                    Open
                  </button>
                  <button
                    className="btn btn-danger"
                    disabled={busy}
                    onClick={() => run(() => api.adminRejectRequirement(r.id, 'Not a fit'))}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <h2 style={{ margin: 0 }}>Providers pending</h2>
        {providers.length === 0 ? (
          <div className="empty panel">No providers waiting.</div>
        ) : (
          <div className="list">
            {providers.map((p) => (
              <div key={p.id} className="list-item">
                <div className="row">
                  <h3>{p.headline || p.id.slice(0, 8)}</h3>
                  <StatusChip label={providerStatusLabel[p.status]} tone="amber" />
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {p.serviceCategories} · {p.city || '—'}
                </p>
                <button
                  className="btn btn-accent"
                  disabled={busy}
                  onClick={() => run(() => api.adminVerifyProvider(p.id))}
                >
                  Verify
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <h2 style={{ margin: 0 }}>Disputes</h2>
        {disputes.length === 0 ? (
          <div className="empty panel">No open disputes.</div>
        ) : (
          <div className="list">
            {disputes.map((d) => (
              <div key={d.id} className="list-item">
                <h3>Dispute {d.id.slice(0, 8)}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {d.reason}
                </p>
                <button
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => run(() => api.adminResolveDispute(d.id, 'Resolved'))}
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
