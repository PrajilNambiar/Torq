import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { campaignsApi, opportunitiesApi, providersApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, EmptyState, Spinner, Stat } from '../../components/ui'
import { TickIcon } from '../../components/TickIcon'
import {
  IconBriefcase,
  IconCheckCircle,
  IconCurrency,
  IconMegaphone,
  IconSearch,
  IconShield,
} from '../../components/icons'
import { CampaignStatus, ProviderStatus } from '../../types/enums'
import { budget, date, money, shortId } from '../../lib/format'
import { VerificationBanner } from './VerificationBanner'

export function ProviderDashboard() {
  const { user } = useAuth()
  const provider = useQuery({ queryKey: ['provider'], queryFn: providersApi.get })
  const verified = provider.data?.status === ProviderStatus.Verified
  const opps = useQuery({ queryKey: ['opportunities', 1], queryFn: () => opportunitiesApi.list(1, 5), enabled: verified })
  const camps = useQuery({ queryKey: ['campaigns', 1], queryFn: () => campaignsApi.list(1, 50) })
  const services = useQuery({ queryKey: ['services'], queryFn: providersApi.services })
  const portfolio = useQuery({ queryKey: ['portfolio'], queryFn: providersApi.portfolio })
  const social = useQuery({ queryKey: ['social'], queryFn: providersApi.social })

  if (provider.isLoading) return <Spinner />
  const campaigns = camps.data?.items ?? []
  const active = campaigns.filter((c) => c.status !== CampaignStatus.Completed && c.status !== CampaignStatus.Cancelled)
  const completed = campaigns.length - active.length
  const earned = campaigns.filter((c) => c.status === CampaignStatus.Completed).reduce((sum, c) => sum + c.agreedPrice - c.platformFeeAmount, 0)

  const checklist = [
    { done: Boolean(provider.data?.headline && provider.data.serviceCategories), label: 'Complete your profile', to: '/provider/profile' },
    { done: (services.data?.length ?? 0) > 0, label: 'Add at least one service', to: '/provider/services' },
    { done: (portfolio.data?.length ?? 0) > 0, label: 'Add a portfolio item', to: '/provider/portfolio' },
    { done: (social.data?.length ?? 0) > 0, label: 'Link a social account', to: '/provider/social' },
  ]
  const doneCount = checklist.filter((item) => item.done).length
  const progress = Math.round((doneCount / checklist.length) * 100)
  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  return (
    <div className="dash">
      <section className="dash-welcome">
        <div className="dash-welcome-copy">
          <p className="dash-kicker">Provider workspace</p>
          <h1>Welcome back, {firstName}</h1>
          <p className="muted dash-welcome-sub">
            {verified
              ? 'Browse matching briefs, send proposals, and keep campaigns moving.'
              : 'Finish setup so Torq can verify your profile and unlock opportunities.'}
          </p>
          {provider.data && (
            <div className="dash-welcome-meta">
              <StatusBadge kind="provider" status={provider.data.status} />
            </div>
          )}
        </div>
        <div className="dash-welcome-actions">
          {verified ? (
            <Link to="/provider/opportunities" className="btn primary">
              Browse opportunities
            </Link>
          ) : (
            <Link to="/provider/profile" className="btn primary">
              Continue setup
            </Link>
          )}
        </div>
      </section>

      <VerificationBanner provider={provider.data} />

      <div className="stats">
        <Stat
          label="New opportunities"
          value={verified ? (opps.data?.total ?? '…') : '—'}
          tone="blue"
          icon={<IconSearch size={18} />}
        />
        <Stat label="Active campaigns" value={active.length} tone="cyan" icon={<IconMegaphone size={18} />} />
        <Stat label="Completed" value={completed} tone="green" icon={<IconCheckCircle size={18} />} />
        <Stat label="Earned (after fees)" value={money(earned)} tone="amber" icon={<IconCurrency size={18} />} />
      </div>

      <div className="grid-2">
        {!verified ? (
          <Card title="Get verified" className="dash-panel">
            <div className="dash-progress">
              <div className="dash-progress-head">
                <span className="dash-progress-label">
                  {doneCount} of {checklist.length} complete
                </span>
                <span className="muted small">{progress}%</span>
              </div>
              <div className="dash-progress-track" aria-hidden>
                <div className="dash-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <ul className="checklist">
              {checklist.map((item) => (
                <li key={item.label} className={item.done ? 'done' : ''}>
                  <span aria-hidden>
                    {item.done ? (
                      <TickIcon size={15} strokeWidth={2.2} className="checklist-tick" />
                    ) : (
                      <span className="checklist-circle">○</span>
                    )}
                  </span>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card
            title="Matching opportunities"
            actions={<Link to="/provider/opportunities">View all</Link>}
            className="dash-panel"
          >
            {!opps.data?.items.length ? (
              <EmptyState
                icon={<IconBriefcase size={28} />}
                action={
                  <Link to="/provider/opportunities" className="btn ghost small">
                    Refresh opportunities
                  </Link>
                }
              >
                No open requirements match your categories right now.
              </EmptyState>
            ) : (
              <ul className="list dash-list">
                {opps.data.items.map((o) => (
                  <li key={o.id}>
                    <div>
                      <Link to={`/provider/opportunities/${o.id}`}>{o.title}</Link>
                      <div className="muted small">
                        {o.category} · {budget(o.budgetMin, o.budgetMax)} · due {date(o.proposalDeadlineAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <Card title="Campaigns" actions={<Link to="/campaigns">View all</Link>} className="dash-panel">
          {active.length === 0 ? (
            <EmptyState
              icon={<IconMegaphone size={28} />}
              action={
                verified ? (
                  <Link to="/provider/opportunities" className="btn ghost small">
                    Find work
                  </Link>
                ) : (
                  <span className="muted small row-inline">
                    <IconShield size={14} /> Verification unlocks proposals
                  </span>
                )
              }
            >
              When a business selects your proposal, the campaign appears here.
            </EmptyState>
          ) : (
            <ul className="list dash-list">
              {active.map((c) => (
                <li key={c.id}>
                  <div>
                    <Link to={`/campaigns/${c.id}`}>Campaign {shortId(c.id)}</Link>
                    <div className="muted small">{money(c.agreedPrice, c.currency)}</div>
                  </div>
                  <StatusBadge kind="campaign" status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
