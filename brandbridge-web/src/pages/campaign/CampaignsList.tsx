import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, EmptyState, ErrorBox, PageHeader, Pager, Spinner } from '../../components/ui'
import { date, money, shortId } from '../../lib/format'

export function CampaignsList() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', 'list', page],
    queryFn: () => campaignsApi.list(page, 20),
  })

  return (
    <>
      <PageHeader title="Campaigns" subtitle="Selected proposals become campaigns with milestones, messages and payments." />
      <ErrorBox error={error} />
      <Card>
        {isLoading ? (
          <Spinner />
        ) : !data?.items.length ? (
          <EmptyState>No campaigns yet.</EmptyState>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Agreed price</th>
                  <th>Platform fee</th>
                  <th>Started</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/campaigns/${c.id}`}>Campaign {shortId(c.id)}</Link>
                    </td>
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
            <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  )
}
