import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { ProposalDto, RequirementDto } from '../../api/types'
import { ProposalStatus, RequirementStatus } from '../../api/types'
import { StatusChip } from '../../components/StatusChip'
import { money, proposalStatusLabel, requirementStatusLabel } from '../../lib/labels'

export function RequirementDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [requirement, setRequirement] = useState<RequirementDto | null>(null)
  const [proposals, setProposals] = useState<ProposalDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [req, props] = await Promise.all([api.getRequirement(id), api.listProposals(id)])
    setRequirement(req)
    setProposals(props)
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      await api.submitRequirement(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  async function shortlist(proposalId: string) {
    setBusy(true)
    setError(null)
    try {
      await api.shortlistProposal(id, proposalId)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Shortlist failed')
    } finally {
      setBusy(false)
    }
  }

  async function select(proposalId: string) {
    setBusy(true)
    setError(null)
    try {
      const campaign = await api.selectProposal(id, proposalId)
      navigate(`/business/campaigns/${campaign.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Select failed')
      setBusy(false)
    }
  }

  if (!requirement && !error) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!requirement) {
    return (
      <div className="page">
        <div className="alert">{error}</div>
      </div>
    )
  }

  return (
    <div className="page stack-lg">
      <div className="section-head">
        <div>
          <div className="row">
            <h1>{requirement.title}</h1>
            <StatusChip label={requirementStatusLabel[requirement.status]} tone="teal" />
          </div>
          <p className="muted">
            {requirement.category} · created {new Date(requirement.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="row">
          {requirement.status === RequirementStatus.Draft && (
            <button className="btn btn-accent" disabled={busy} onClick={submit}>
              Submit for review
            </button>
          )}
          <Link className="btn btn-ghost" to="/business">
            Back
          </Link>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>Brief</h2>
        <p style={{ margin: 0 }}>{requirement.goal}</p>
        <p className="muted" style={{ margin: 0 }}>
          Deliverables: {requirement.expectedDeliverables}
        </p>
        <div className="row muted">
          {(requirement.budgetMin != null || requirement.budgetMax != null) && (
            <span>
              Budget {requirement.budgetMin != null ? money(requirement.budgetMin, requirement.currency) : '—'}{' '}
              – {requirement.budgetMax != null ? money(requirement.budgetMax, requirement.currency) : '—'}
            </span>
          )}
          {requirement.timelineDays != null && <span>{requirement.timelineDays} days</span>}
          {requirement.location && <span>{requirement.location}</span>}
        </div>
      </section>

      <section className="stack">
        <div className="section-head">
          <h2>Proposals</h2>
        </div>
        {proposals.length === 0 ? (
          <div className="empty panel">No proposals yet.</div>
        ) : (
          <div className="compare-grid">
            {proposals.map((p) => (
              <article key={p.id} className="panel stack">
                <div className="row">
                  <strong>{p.providerHeadline || 'Provider'}</strong>
                  <StatusChip label={proposalStatusLabel[p.status]} />
                </div>
                <div>{money(p.priceAmount, p.currency)}</div>
                <p className="muted" style={{ margin: 0 }}>
                  {p.timelineDays} days · {p.revisionsIncluded} revisions
                </p>
                <p style={{ margin: 0 }}>{p.coverNote || p.scopeOfWork}</p>
                <div className="row">
                  {(p.status === ProposalStatus.Submitted ||
                    p.status === ProposalStatus.Shortlisted) && (
                    <>
                      {p.status === ProposalStatus.Submitted && (
                        <button
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() => shortlist(p.id)}
                        >
                          Shortlist
                        </button>
                      )}
                      <button className="btn btn-primary" disabled={busy} onClick={() => select(p.id)}>
                        Select
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
