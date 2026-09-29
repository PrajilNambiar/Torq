import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { requirementsApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Card, EmptyState, ErrorBox, PageHeader, Pager, Spinner } from '../../components/ui'
import { budget, date } from '../../lib/format'

export function RequirementsList() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useQuery({
    queryKey: ['requirements', 'list', page],
    queryFn: () => requirementsApi.list(page, 20),
  })

  return (
    <>
      <PageHeader
        title="Requirements"
        subtitle="Everything you've posted, from draft to closed."
        actions={
          <Link to="/business/requirements/new" className="btn primary">
            Post a requirement
          </Link>
        }
      />
      <ErrorBox error={error} />
      <Card>
        {isLoading ? (
          <Spinner />
        ) : !data?.items.length ? (
          <EmptyState>No requirements yet.</EmptyState>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/business/requirements/${r.id}`}>{r.title}</Link>
                    </td>
                    <td>{r.category}</td>
                    <td>{budget(r.budgetMin, r.budgetMax, r.currency)}</td>
                    <td>{date(r.proposalDeadlineAt)}</td>
                    <td>
                      <StatusBadge kind="requirement" status={r.status} />
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
