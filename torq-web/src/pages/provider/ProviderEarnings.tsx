import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api'
import { Card, ErrorBox, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { dateTime, money, shortId } from '../../lib/format'

export function ProviderEarnings() {
  const toast = useToast()
  const qc = useQueryClient()
  const earnings = useQuery({ queryKey: ['earnings'], queryFn: providersApi.earnings })
  const reputation = useQuery({ queryKey: ['reputation'], queryFn: providersApi.reputation })
  const [label, setLabel] = useState('')

  const save = useMutation({
    mutationFn: () => providersApi.payoutAccount(label),
    onSuccess: () => {
      setLabel('')
      toast.success('Payout account label saved.')
      qc.invalidateQueries({ queryKey: ['earnings'] })
    },
    onError: toast.error,
  })

  return (
    <>
      <PageHeader title="Earnings" subtitle="Payout history and the account label used for transfers." />
      <ErrorBox error={earnings.error ?? reputation.error} />
      {reputation.data && (
        <Card title="Reputation">
          <p>
            {reputation.data.badge ?? 'No badge yet'} · {reputation.data.averageRating.toFixed(1)} average ·{' '}
            {reputation.data.completedJobs} completed ·{' '}
            {reputation.data.responseHours == null ? 'response time not available yet' : `${reputation.data.responseHours.toFixed(1)}h typical response`}
          </p>
        </Card>
      )}
      <Card title="Payout account">
        <form
          className="row"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <input
            aria-label="Payout account label"
            placeholder="Bank name and last four digits"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button className="btn primary" disabled={save.isPending}>Save label</button>
        </form>
      </Card>
      <Card title="Payout history">
        {earnings.isLoading ? (
          <Spinner />
        ) : !earnings.data?.length ? (
          <p className="muted">No payouts yet.</p>
        ) : (
          <ul className="list">
            {earnings.data.map((row) => (
              <li key={row.id}>
                <span>
                  {shortId(row.campaignId)} · {row.status} · {dateTime(row.createdAt)}
                </span>
                <span>{money(row.netAmount, row.currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
