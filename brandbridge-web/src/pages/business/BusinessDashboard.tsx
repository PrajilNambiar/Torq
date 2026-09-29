import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { campaignsApi, requirementsApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, EmptyState, ErrorBox, PageHeader, Spinner, Stat } from '../../components/ui'
import { CampaignStatus, RequirementStatus } from '../../types/enums'
import { budget, date, money, shortId } from '../../lib/format'

export function BusinessDashboard() {
  const reqs = useQuery({ queryKey: ['requirements', 1], queryFn: () => requirementsApi.list(1, 50) })
  const camps = useQuery({ queryKey: ['campaigns', 1], queryFn: () => campaignsApi.list(1, 50) })

  if (reqs.isLoading || camps.isLoading) return <Spinner />

  const requirements = reqs.data?.items ?? []
  const campaigns = camps.data?.items ?? []
  const openCount = requirements.filter((r) =>
    ([RequirementStatus.Open, RequirementStatus.ProposalReview] as number[]).includes(r.status),
  ).length
  const reviewing = requirements.filter((r) => r.status === RequirementStatus.ProposalReview)
  const needsAction = campaigns.filter((c) =>
    ([CampaignStatus.PendingFunding, CampaignStatus.AwaitingApproval] as number[]).includes(c.status),
  )
  const titleOf = (id: string) => requirements.find((r) => r.id === id)?.title ?? `Requirement ${shortId(id)}`

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          <Link to="/business/requirements/new" className="btn primary">
            Post a requirement
          </Link>
        }
      />
      <ErrorBox error={reqs.error ?? camps.error} />

      <div className="stats">
        <Stat label="Open requirements" value={openCount} />
        <Stat label="Proposals to review" value={reviewing.length} />
        <Stat label="Active campaigns" value={campaigns.filter((c) => c.status !== CampaignStatus.Completed).length} />
        <Stat label="Waiting on you" value={needsAction.length} />
      </div>

      <div className="grid-2">
        <Card title="Needs your action">
          {needsAction.length === 0 && reviewing.length === 0 ? (
            <EmptyState>Nothing waiting on you right now.</EmptyState>
          ) : (
            <ul className="list">
              {reviewing.map((r) => (
                <li key={r.id}>
                  <Link to={`/business/requirements/${r.id}/proposals`}>{r.title}</Link>
                  <span className="muted">Compare proposals</span>
                </li>
              ))}
              {needsAction.map((c) => (
                <li key={c.id}>
                  <Link to={`/campaigns/${c.id}`}>{titleOf(c.requirementId)}</Link>
                  <StatusBadge kind="campaign" status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent requirements" actions={<Link to="/business/requirements">View all</Link>}>
          {requirements.length === 0 ? (
            <EmptyState>
              You haven't posted anything yet. <Link to="/business/requirements/new">Post your first requirement</Link>.
            </EmptyState>
          ) : (
            <ul className="list">
              {requirements.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <div>
                    <Link to={`/business/requirements/${r.id}`}>{r.title}</Link>
                    <div className="muted small">
                      {budget(r.budgetMin, r.budgetMax, r.currency)} · {date(r.createdAt)}
                    </div>
                  </div>
                  <StatusBadge kind="requirement" status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Campaigns" actions={<Link to="/campaigns">View all</Link>}>
        {campaigns.length === 0 ? (
          <EmptyState>Campaigns appear here once you select a proposal.</EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Agreed price</th>
                <th>Started</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.slice(0, 6).map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/campaigns/${c.id}`}>{titleOf(c.requirementId)}</Link>
                  </td>
                  <td>{money(c.agreedPrice, c.currency)}</td>
                  <td>{date(c.createdAt)}</td>
                  <td>
                    <StatusBadge kind="campaign" status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}
