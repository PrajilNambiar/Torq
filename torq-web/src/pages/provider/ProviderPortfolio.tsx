import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api'
import { Card, EmptyState, ErrorBox, Field, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { blank } from '../../lib/format'

const empty = { title: '', description: '', clientOrIndustry: '', mediaUrl: '', metricsEvidence: '' }

export function ProviderPortfolio() {
  const toast = useToast()
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['portfolio'], queryFn: providersApi.portfolio })
  const [form, setForm] = useState(empty)

  const add = useMutation({
    mutationFn: () =>
      providersApi.addPortfolio({
        title: form.title.trim(),
        description: blank(form.description),
        clientOrIndustry: blank(form.clientOrIndustry),
        mediaUrl: blank(form.mediaUrl),
        metricsEvidence: blank(form.metricsEvidence),
      }),
    onSuccess: () => {
      setForm(empty)
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      toast.success('Portfolio item added.')
    },
    onError: toast.error,
  })

  const set = (key: keyof typeof empty) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })

  return (
    <>
      <PageHeader title="Portfolio" subtitle="Evidence of past work. You can attach these items to proposals." />
      <ErrorBox error={error} />
      <div className="grid-2">
        <Card title="Your work">
          {isLoading ? (
            <Spinner />
          ) : !data?.length ? (
            <EmptyState>No portfolio items yet.</EmptyState>
          ) : (
            <div className="tiles">
              {data.map((p) => (
                <article key={p.id} className="tile">
                  <strong>{p.title}</strong>
                  {p.clientOrIndustry && <span className="muted small">{p.clientOrIndustry}</span>}
                  {p.description && <p className="small">{p.description}</p>}
                  {p.metricsEvidence && <p className="small">📈 {p.metricsEvidence}</p>}
                  {p.mediaUrl && (
                    <a href={p.mediaUrl} target="_blank" rel="noreferrer" className="small">
                      View media ↗
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card title="Add portfolio item">
          <form
            className="stack"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              add.mutate()
            }}
          >
            <Field label="Title">
              <input required value={form.title} onChange={set('title')} placeholder="Menu launch reels for a Kochi café" />
            </Field>
            <Field label="Client or industry">
              <input value={form.clientOrIndustry} onChange={set('clientOrIndustry')} placeholder="Food & beverage" />
            </Field>
            <Field label="Media link">
              <input type="url" value={form.mediaUrl} onChange={set('mediaUrl')} placeholder="https://instagram.com/reel/…" />
            </Field>
            <Field label="Results / metrics" hint="Only share numbers you have permission to share.">
              <input value={form.metricsEvidence} onChange={set('metricsEvidence')} placeholder="120k views, 4.2% engagement" />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={set('description')} />
            </Field>
            <button className="btn primary" disabled={add.isPending}>
              Add item
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
