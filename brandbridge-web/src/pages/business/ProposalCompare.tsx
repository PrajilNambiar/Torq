import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requirementsApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Alert, EmptyState, ErrorBox, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { ProposalStatus, labels } from '../../types/enums'
import type { ProposalDto } from '../../types/api'
import { budget, money, shortId } from '../../lib/format'

type SortKey = 'price' | 'timeline' | 'revisions' | 'newest'

const sorters: Record<SortKey, (a: ProposalDto, b: ProposalDto) => number> = {
  price: (a, b) => a.priceAmount - b.priceAmount,
  timeline: (a, b) => a.timelineDays - b.timelineDays,
  revisions: (a, b) => b.revisionsIncluded - a.revisionsIncluded,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
}

const selectable: number[] = [ProposalStatus.Submitted, ProposalStatus.Shortlisted]

/** Side-by-side proposal comparison, the core business screen in the blueprint. */
export function ProposalCompare() {
  const { id } = useParams() as { id: string }
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [sort, setSort] = useState<SortKey>('price')
  const [onlyShortlisted, setOnlyShortlisted] = useState(false)
  const [confirming, setConfirming] = useState<ProposalDto | null>(null)

  const req = useQuery({ queryKey: ['requirement', id], queryFn: () => requirementsApi.get(id) })
  const proposals = useQuery({ queryKey: ['proposals', id], queryFn: () => requirementsApi.proposals(id) })

  const shortlist = useMutation({
    mutationFn: (proposalId: string) => requirementsApi.shortlist(id, proposalId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['proposals', id] })
      toast.success('Added to shortlist.')
    },
    onError: toast.error,
  })

  const select = useMutation({
    mutationFn: (proposalId: string) => requirementsApi.select(id, proposalId),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['requirement', id] })
      qc.invalidateQueries({ queryKey: ['requirements'] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Provider selected. Fund the campaign to start work.')
      navigate(`/campaigns/${campaign.id}`)
    },
    onError: toast.error,
  })

  const rows = useMemo(() => {
    const list = (proposals.data ?? []).filter((p) => !onlyShortlisted || p.status === ProposalStatus.Shortlisted)
    return [...list].sort(sorters[sort])
  }, [proposals.data, onlyShortlisted, sort])

  if (req.isLoading || proposals.isLoading) return <Spinner />
  const r = req.data
  const lowest = rows.length ? Math.min(...rows.map((p) => p.priceAmount)) : null
  const fastest = rows.length ? Math.min(...rows.map((p) => p.timelineDays)) : null

  return (
    <>
      <PageHeader
        back={`/business/requirements/${id}`}
        title={r?.title ?? 'Proposals'}
        subtitle={
          r && (
            <>
              {budget(r.budgetMin, r.budgetMax, r.currency)}
              {r.timelineDays ? ` · ${r.timelineDays} days` : ''}
              {r.location ? ` · ${r.location}` : ''} · {proposals.data?.length ?? 0}{' '}
              {proposals.data?.length === 1 ? 'proposal' : 'proposals'}
            </>
          )
        }
      />
      <ErrorBox error={req.error ?? proposals.error} />

      <div className="toolbar">
        <label className="inline">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="price">Lowest price</option>
            <option value="timeline">Fastest delivery</option>
            <option value="revisions">Most revisions</option>
            <option value="newest">Newest</option>
          </select>
        </label>
        <label className="inline">
          <input type="checkbox" checked={onlyShortlisted} onChange={(e) => setOnlyShortlisted(e.target.checked)} />
          Shortlisted only
        </label>
      </div>

      {rows.length === 0 ? (
        <EmptyState>{onlyShortlisted ? 'No shortlisted proposals yet.' : 'No proposals yet. Verified providers are being notified.'}</EmptyState>
      ) : (
        <div className="compare">
          {rows.map((p) => (
            <article key={p.id} className={`compare-col ${p.status === ProposalStatus.Shortlisted ? 'shortlisted' : ''}`}>
              <header>
                <strong>{p.providerHeadline ?? `Provider ${shortId(p.providerProfileId)}`}</strong>
                <StatusBadge kind="proposal" status={p.status} />
              </header>
              <div className="compare-price">
                {money(p.priceAmount, p.currency)}
                {p.priceAmount === lowest && rows.length > 1 && <span className="tag">Lowest</span>}
              </div>
              <div className="muted small">{labels.pricingModel[p.pricingModel]}</div>
              <dl className="compare-facts">
                <div>
                  <dt>Timeline</dt>
                  <dd>
                    {p.timelineDays} days
                    {p.timelineDays === fastest && rows.length > 1 && <span className="tag">Fastest</span>}
                  </dd>
                </div>
                <div>
                  <dt>Revisions</dt>
                  <dd>{p.revisionsIncluded}</dd>
                </div>
                <div>
                  <dt>Portfolio items</dt>
                  <dd>{p.portfolioItemIds.length}</dd>
                </div>
              </dl>
              <section>
                <h4>Scope of work</h4>
                <p className="pre">{p.scopeOfWork}</p>
              </section>
              <section>
                <h4>Deliverables</h4>
                <p className="pre">{p.deliverables}</p>
              </section>
              {p.coverNote && (
                <section>
                  <h4>Cover note</h4>
                  <p className="pre">{p.coverNote}</p>
                </section>
              )}
              {selectable.includes(p.status) && (
                <footer>
                  {p.status === ProposalStatus.Submitted && (
                    <button className="btn ghost" disabled={shortlist.isPending} onClick={() => shortlist.mutate(p.id)}>
                      ☆ Shortlist
                    </button>
                  )}
                  <button className="btn primary" onClick={() => setConfirming(p)}>
                    Select
                  </button>
                </footer>
              )}
            </article>
          ))}
        </div>
      )}

      {confirming && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm selection">
          <div className="modal">
            <h2>Select this proposal?</h2>
            <p>
              You're selecting <strong>{confirming.providerHeadline ?? 'this provider'}</strong> for{' '}
              <strong>{money(confirming.priceAmount, confirming.currency)}</strong>. All other proposals will be declined
              and a campaign workspace will be created.
            </p>
            <Alert tone="info">A platform fee is calculated on the agreed price. You fund the campaign in the next step.</Alert>
            <div className="form-actions">
              <button className="btn ghost" onClick={() => setConfirming(null)}>
                Cancel
              </button>
              <button className="btn primary" disabled={select.isPending} onClick={() => select.mutate(confirming.id)}>
                {select.isPending ? 'Selecting…' : 'Confirm selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
