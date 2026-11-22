import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, DefinitionList, EmptyState, ErrorBox, PageHeader, Pager, Spinner, Stat } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { CampaignStatus, DisputeStatus, labels } from '../../types/enums'
import { budget, date, dateTime, money, shortId } from '../../lib/format'

function useAdminAction<T>(fn: (arg: T) => Promise<unknown>, success: string, keys: string[][]) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      keys.forEach((queryKey) => qc.invalidateQueries({ queryKey }))
      toast.success(success)
    },
    onError: toast.error,
  })
}

export function AdminOverview() {
  const reqs = useQuery({ queryKey: ['admin', 'requirements', 1], queryFn: () => adminApi.pendingRequirements(1) })
  const provs = useQuery({ queryKey: ['admin', 'providers', 1], queryFn: () => adminApi.pendingProviders(1) })
  const disputes = useQuery({ queryKey: ['admin', 'disputes', 1], queryFn: () => adminApi.disputes(1) })
  const camps = useQuery({ queryKey: ['admin', 'campaigns', 1], queryFn: () => adminApi.campaigns(1) })

  const openDisputes = disputes.data?.items.filter((d) => d.status === DisputeStatus.Open || d.status === DisputeStatus.UnderReview).length

  return (
    <>
      <PageHeader title="Marketplace overview" subtitle="Trust before scale: review every requirement and provider before it goes live." />
      <div className="stats">
        <Stat label="Requirements to review" value={reqs.data?.total ?? '…'} />
        <Stat label="Providers to verify" value={provs.data?.total ?? '…'} />
        <Stat label="Open disputes" value={openDisputes ?? '…'} />
        <Stat label="Campaigns" value={camps.data?.total ?? '…'} />
      </div>
      <div className="grid-2">
        <Card title="Queues">
          <ul className="list">
            <li>
              <Link to="/admin/requirements">Requirement moderation</Link>
              <span className="badge warn">{reqs.data?.total ?? 0}</span>
            </li>
            <li>
              <Link to="/admin/providers">Provider verification</Link>
              <span className="badge warn">{provs.data?.total ?? 0}</span>
            </li>
            <li>
              <Link to="/admin/disputes">Dispute center</Link>
              <span className="badge danger">{openDisputes ?? 0}</span>
            </li>
          </ul>
        </Card>
        <Card title="Campaigns by status">
          <ul className="list">
            {Object.values(CampaignStatus).map((s) => (
              <li key={s}>
                <StatusBadge kind="campaign" status={s} />
                <span>{camps.data?.items.filter((c) => c.status === s).length ?? 0}</span>
              </li>
            ))}
          </ul>
          <p className="muted small">Counts cover the most recent page of campaigns.</p>
        </Card>
      </div>
    </>
  )
}

export function AdminRequirements() {
  const [page, setPage] = useState(1)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'requirements', page],
    queryFn: () => adminApi.pendingRequirements(page),
  })
  const open = useAdminAction((id: string) => adminApi.openRequirement(id, notes[id]), 'Requirement opened to providers.', [['admin']])
  const reject = useAdminAction((id: string) => adminApi.rejectRequirement(id, notes[id]), 'Requirement rejected.', [['admin']])

  return (
    <>
      <PageHeader title="Requirement moderation" subtitle="Check the brief is clear, legal and realistic before providers see it." />
      <ErrorBox error={error} />
      {isLoading ? (
        <Spinner />
      ) : !data?.items.length ? (
        <EmptyState>The queue is empty.</EmptyState>
      ) : (
        <>
          {data.items.map((r) => (
            <Card key={r.id} title={r.title} actions={<span className="badge info">{r.category}</span>}>
              <DefinitionList
                items={[
                  ['Goal', r.goal],
                  ['Deliverables', r.expectedDeliverables],
                  ['Audience', r.targetAudience],
                  ['Location / languages', [r.location, r.languages].filter(Boolean).join(' · ')],
                  ['Budget', budget(r.budgetMin, r.budgetMax, r.currency)],
                  ['Timeline', r.timelineDays ? `${r.timelineDays} days` : null],
                  ['Submitted', date(r.createdAt)],
                ]}
              />
              <div className="row">
                <input
                  aria-label="Moderator notes"
                  placeholder="Notes (optional)"
                  value={notes[r.id] ?? ''}
                  onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                />
                <button className="btn ghost danger" disabled={reject.isPending} onClick={() => reject.mutate(r.id)}>
                  Reject
                </button>
                <button className="btn primary" disabled={open.isPending} onClick={() => open.mutate(r.id)}>
                  Approve and open
                </button>
              </div>
            </Card>
          ))}
          <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  )
}

export function AdminProviders() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'providers', page],
    queryFn: () => adminApi.pendingProviders(page),
  })
  const verify = useAdminAction((id: string) => adminApi.verifyProvider(id), 'Provider verified.', [['admin']])
  const suspend = useAdminAction((id: string) => adminApi.suspendUser(id), 'User suspended.', [['admin']])
  const flag = useAdminAction((id: string) => adminApi.flagUser(id, true), 'User flagged for review.', [['admin']])

  return (
    <>
      <PageHeader title="Provider verification" subtitle="Only verify what you have actually checked." />
      <ErrorBox error={error} />
      <Card>
        {isLoading ? (
          <Spinner />
        ) : !data?.items.length ? (
          <EmptyState>No providers waiting for verification.</EmptyState>
        ) : (
          <>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Categories</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.headline ?? `Provider ${shortId(p.id)}`}</strong>
                        {p.bio && <div className="muted small clamp">{p.bio}</div>}
                      </td>
                      <td>{labels.providerType[p.providerType]}</td>
                      <td>{p.serviceCategories.split(',').join(', ') || '—'}</td>
                      <td>{[p.city, p.region].filter(Boolean).join(', ') || '—'}</td>
                      <td>
                        <StatusBadge kind="provider" status={p.status} />
                      </td>
                      <td>
                        <button className="btn primary small" disabled={verify.isPending} onClick={() => verify.mutate(p.id)}>
                          Verify
                        </button>
                        <button className="btn ghost small" disabled={suspend.isPending} onClick={() => suspend.mutate(p.userId)}>
                          Suspend
                        </button>
                        <button className="btn ghost small" disabled={flag.isPending} onClick={() => flag.mutate(p.userId)}>
                          Flag
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  )
}

export function AdminDisputes() {
  const [page, setPage] = useState(1)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'disputes', page], queryFn: () => adminApi.disputes(page) })
  const resolve = useAdminAction((id: string) => adminApi.resolveDispute(id, notes[id]), 'Dispute resolved.', [['admin']])

  return (
    <>
      <PageHeader title="Dispute center" />
      <ErrorBox error={error} />
      {isLoading ? (
        <Spinner />
      ) : !data?.items.length ? (
        <EmptyState>No disputes.</EmptyState>
      ) : (
        <>
          {data.items.map((d) => (
            <Card key={d.id} title={`Campaign ${shortId(d.campaignId)}`} actions={<StatusBadge kind="dispute" status={d.status} />}>
              <p className="pre">{d.reason}</p>
              <p className="muted small">
                Opened {dateTime(d.createdAt)} by user {shortId(d.openedByUserId)}
              </p>
              {(d.status === DisputeStatus.Open || d.status === DisputeStatus.UnderReview) && (
                <div className="row">
                  <input
                    aria-label="Resolution notes"
                    placeholder="Resolution notes"
                    value={notes[d.id] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })}
                  />
                  <button className="btn primary" disabled={resolve.isPending} onClick={() => resolve.mutate(d.id)}>
                    Mark resolved
                  </button>
                </div>
              )}
            </Card>
          ))}
          <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  )
}

export function AdminCampaigns() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'campaigns', page], queryFn: () => adminApi.campaigns(page) })

  return (
    <>
      <PageHeader title="Campaigns" subtitle="All marketplace transactions." />
      <ErrorBox error={error} />
      <Card>
        {isLoading ? (
          <Spinner />
        ) : !data?.items.length ? (
          <EmptyState>No campaigns yet.</EmptyState>
        ) : (
          <>
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Requirement</th>
                    <th>Agreed price</th>
                    <th>Platform fee</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((c) => (
                    <tr key={c.id}>
                      <td>{shortId(c.id)}</td>
                      <td>{shortId(c.requirementId)}</td>
                      <td>{money(c.agreedPrice, c.currency)}</td>
                      <td>{money(c.platformFeeAmount, c.currency)}</td>
                      <td>{date(c.createdAt)}</td>
                      <td>
                        <StatusBadge kind="campaign" status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  )
}

export function AdminTrust() {
  const toast = useToast()
  const qc = useQueryClient()
  const audit = useQuery({ queryKey: ['admin', 'audit'], queryFn: () => adminApi.audit(1) })
  const exceptions = useQuery({ queryKey: ['admin', 'payments'], queryFn: adminApi.paymentExceptions })
  const settings = useQuery({ queryKey: ['admin', 'settings'], queryFn: adminApi.settings })
  const [fee, setFee] = useState('')
  const [geo, setGeo] = useState('')
  const save = useMutation({
    mutationFn: () => adminApi.updateSettings(Number(fee || settings.data?.platformFeePercent || 10), geo || settings.data?.allowedGeographies || 'IN'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
      toast.success('Marketplace settings saved.')
    },
    onError: toast.error,
  })

  return (
    <>
      <PageHeader title="Trust and payments" subtitle="Audit trail, failed or pending charges, commission, and geography." />
      <ErrorBox error={audit.error ?? exceptions.error ?? settings.error} />
      <Card title="Commission and geography">
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <input aria-label="Platform fee percent" placeholder="Fee %" value={fee} onChange={(e) => setFee(e.target.value)} />
          <input aria-label="Allowed geographies" placeholder="IN, AE" value={geo} onChange={(e) => setGeo(e.target.value)} />
          <button className="btn primary" disabled={save.isPending}>Save</button>
        </form>
        {settings.data && (
          <p className="muted small">Current fee {settings.data.platformFeePercent}% · {settings.data.allowedGeographies}</p>
        )}
      </Card>
      <Card title="Payment exceptions">
        {(exceptions.data ?? []).length === 0 ? (
          <p className="muted">No failed or processing payments.</p>
        ) : (
          <ul className="list">
            {exceptions.data!.map((p) => (
              <li key={p.id}>
                <span>{shortId(p.campaignId)} · {p.status}</span>
                <span>{money(p.amount, p.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Audit trail">
        {(audit.data?.items ?? []).length === 0 ? (
          <p className="muted">No audit events.</p>
        ) : (
          <ul className="list">
            {audit.data!.items.map((event) => (
              <li key={event.id}>
                <span>{event.entityType} · {event.action}</span>
                <span className="muted">{dateTime(event.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
