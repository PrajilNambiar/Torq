import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { campaignsApi, opportunitiesApi, providersApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, EmptyState, PageHeader, Spinner, Stat } from '../../components/ui'
import { TickIcon } from '../../components/TickIcon'
import { CampaignStatus, ProviderStatus } from '../../types/enums'
import { budget, date, money, shortId } from '../../lib/format'
import { VerificationBanner } from './VerificationBanner'

export function ProviderDashboard() {
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
  const earned = campaigns.filter((c) => c.status === CampaignStatus.Completed).reduce((sum, c) => sum + c.agreedPrice - c.platformFeeAmount, 0)

  const checklist = [
    { done: Boolean(provider.data?.headline && provider.data.serviceCategories), label: 'Complete your profile', to: '/provider/profile' },
    { done: (services.data?.length ?? 0) > 0, label: 'Add at least one service', to: '/provider/services' },
    { done: (portfolio.data?.length ?? 0) > 0, label: 'Add a portfolio item', to: '/provider/portfolio' },
    { done: (social.data?.length ?? 0) > 0, label: 'Link a social account', to: '/provider/social' },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={provider.data && <StatusBadge kind="provider" status={provider.data.status} />}
        actions={
          verified && (
            <Link to="/provider/opportunities" className="btn primary">
              Browse opportunities
            </Link>
          )
        }
      />
      <VerificationBanner provider={provider.data} />

      <div className="stats">
        <Stat label="New opportunities" value={verified ? (opps.data?.total ?? '…') : '—'} />
        <Stat label="Active campaigns" value={active.length} />
        <Stat label="Completed" value={campaigns.length - active.length} />
        <Stat label="Earned (after fees)" value={money(earned)} />
      </div>

      <div className="grid-2">
        {!verified ? (
          <Card title="Get verified">
            <ul className="checklist">
              {checklist.map((item) => (
                <li key={item.label} className={item.done ? 'done' : ''}>
                  <span aria-hidden>{item.done ? <TickIcon size={15} strokeWidth={2.2} className="checklist-tick" /> : <span className="checklist-circle">○</span>}</span>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card title="Matching opportunities" actions={<Link to="/provider/opportunities">View all</Link>}>
            {!opps.data?.items.length ? (
              <EmptyState>No open requirements match your categories right now.</EmptyState>
            ) : (
              <ul className="list">
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

        <Card title="Campaigns" actions={<Link to="/campaigns">View all</Link>}>
          {active.length === 0 ? (
            <EmptyState>When a business selects your proposal, the campaign appears here.</EmptyState>
          ) : (
            <ul className="list">
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
    </>
  )
}
