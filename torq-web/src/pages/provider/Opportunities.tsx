import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { opportunitiesApi, providersApi } from '../../api'
import { Card, EmptyState, ErrorBox, PageHeader, Pager, Spinner } from '../../components/ui'
import { ProviderStatus } from '../../types/enums'
import { budget, date } from '../../lib/format'
import { VerificationBanner } from './VerificationBanner'

export function Opportunities() {
  const [page, setPage] = useState(1)
  const provider = useQuery({ queryKey: ['provider'], queryFn: providersApi.get })
  const verified = provider.data?.status === ProviderStatus.Verified
  const opps = useQuery({
    queryKey: ['opportunities', 'list', page],
    queryFn: () => opportunitiesApi.list(page, 20),
    enabled: verified,
  })

  if (provider.isLoading) return <Spinner />

  return (
    <>
      <PageHeader
        title="Opportunities"
        subtitle={provider.data?.serviceCategories ? `Matching your categories: ${provider.data.serviceCategories.split(',').join(', ')}` : undefined}
      />
      <VerificationBanner provider={provider.data} />
      {verified && (
        <>
          <ErrorBox error={opps.error} />
          {opps.isLoading ? (
            <Spinner />
          ) : !opps.data?.items.length ? (
            <EmptyState>No open requirements match your categories right now. Check back soon.</EmptyState>
          ) : (
            <>
              <div className="opp-grid">
                {opps.data.items.map((o) => (
                  <Card key={o.id} className="opp">
                    <span className="badge info">{o.category}</span>
                    <h3>
                      <Link to={`/provider/opportunities/${o.id}`}>{o.title}</Link>
                    </h3>
                    <p className="muted clamp">{o.goal}</p>
                    <dl className="compare-facts">
                      <div>
                        <dt>Budget</dt>
                        <dd>{budget(o.budgetMin, o.budgetMax)}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{o.location ?? 'Any'}</dd>
                      </div>
                      <div>
                        <dt>Proposals due</dt>
                        <dd>{date(o.proposalDeadlineAt)}</dd>
                      </div>
                    </dl>
                    <Link to={`/provider/opportunities/${o.id}`} className="btn primary small">
                      View and propose
                    </Link>
                  </Card>
                ))}
              </div>
              <Pager page={opps.data.page} pageSize={opps.data.pageSize} total={opps.data.total} onPage={setPage} />
            </>
          )}
        </>
      )}
    </>
  )
}
