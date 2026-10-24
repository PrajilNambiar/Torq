import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { campaignsApi, requirementsApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, EmptyState, ErrorBox, Spinner, Stat } from '../../components/ui'
import {
  IconAlert,
  IconBriefcase,
  IconCheckCircle,
  IconClipboard,
  IconFilePlus,
  IconInbox,
  IconMegaphone,
} from '../../components/icons'
import { CampaignStatus, RequirementStatus } from '../../types/enums'
import { budget, date, money, shortId } from '../../lib/format'

export function BusinessDashboard() {
  const { user } = useAuth()
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
  const activeCampaigns = campaigns.filter((c) => c.status !== CampaignStatus.Completed && c.status !== CampaignStatus.Cancelled)
  const titleOf = (id: string) => requirements.find((r) => r.id === id)?.title ?? `Requirement ${shortId(id)}`
  const firstName = user?.displayName?.split(' ')[0] ?? 'there'
  const waitingCount = needsAction.length + reviewing.length

  return (
    <div className="dash">
      <section className="dash-welcome">
        <div className="dash-welcome-copy">
          <p className="dash-kicker">Brand workspace</p>
          <h1>Welcome back, {firstName}</h1>
          <p className="muted dash-welcome-sub">
            Post briefs, compare proposals, and keep campaigns on track from one place.
          </p>
        </div>
        <div className="dash-welcome-actions">
          <Link to="/business/requirements/new" className="btn primary">
            Post a requirement
          </Link>
        </div>
      </section>

      <ErrorBox error={reqs.error ?? camps.error} />

      <div className="stats">
        <Stat label="Open requirements" value={openCount} tone="blue" icon={<IconClipboard size={18} />} />
        <Stat label="Proposals to review" value={reviewing.length} tone="cyan" icon={<IconInbox size={18} />} />
        <Stat label="Active campaigns" value={activeCampaigns.length} tone="green" icon={<IconMegaphone size={18} />} />
        <Stat label="Waiting on you" value={waitingCount} tone="amber" icon={<IconAlert size={18} />} />
      </div>

      <div className="grid-2">
        <Card title="Needs your action" className="dash-panel">
          {waitingCount === 0 ? (
            <EmptyState icon={<IconCheckCircle size={28} />}>Nothing waiting on you right now.</EmptyState>
          ) : (
            <ul className="list dash-list">
              {reviewing.map((r) => (
                <li key={r.id}>
                  <div>
                    <Link to={`/business/requirements/${r.id}/proposals`}>{r.title}</Link>
                    <div className="muted small">Compare proposals</div>
                  </div>
                  <StatusBadge kind="requirement" status={r.status} />
                </li>
              ))}
              {needsAction.map((c) => (
                <li key={c.id}>
                  <div>
                    <Link to={`/campaigns/${c.id}`}>{titleOf(c.requirementId)}</Link>
                    <div className="muted small">Campaign action needed</div>
                  </div>
                  <StatusBadge kind="campaign" status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent requirements" actions={<Link to="/business/requirements">View all</Link>} className="dash-panel">
          {requirements.length === 0 ? (
            <EmptyState
              icon={<IconFilePlus size={28} />}
              action={
                <Link to="/business/requirements/new" className="btn ghost small">
                  Post your first requirement
                </Link>
              }
            >
              You haven&apos;t posted anything yet.
            </EmptyState>
          ) : (
            <ul className="list dash-list">
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

      <Card title="Campaigns" actions={<Link to="/campaigns">View all</Link>} className="dash-panel">
        {campaigns.length === 0 ? (
          <EmptyState icon={<IconBriefcase size={28} />}>
            Campaigns appear here once you select a proposal.
          </EmptyState>
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
    </div>
  )
}
