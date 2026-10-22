import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api'
import { Card, EmptyState, ErrorBox, Field, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { PricingModel, SERVICE_CATEGORIES, labels, optionsOf } from '../../types/enums'
import { blank, money, num } from '../../lib/format'

const empty = {
  category: SERVICE_CATEGORIES[0] as string,
  title: '',
  description: '',
  startingPrice: '',
  pricingModel: PricingModel.Fixed as PricingModel,
  typicalDeliveryDays: '',
}

export function ProviderServices() {
  const toast = useToast()
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['services'], queryFn: providersApi.services })
  const [form, setForm] = useState(empty)

  const add = useMutation({
    mutationFn: () =>
      providersApi.addService({
        category: form.category,
        title: form.title.trim(),
        description: blank(form.description),
        startingPrice: num(form.startingPrice),
        pricingModel: form.pricingModel,
        typicalDeliveryDays: num(form.typicalDeliveryDays),
      }),
    onSuccess: () => {
      setForm(empty)
      qc.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service added.')
    },
    onError: toast.error,
  })

  const set = (key: 'category' | 'title' | 'description' | 'startingPrice' | 'typicalDeliveryDays') =>
    (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })

  return (
    <>
      <PageHeader title="Services" subtitle="Packaged offerings help businesses understand what you do and what it costs." />
      <ErrorBox error={error} />
      <div className="grid-2">
        <Card title="Your services">
          {isLoading ? (
            <Spinner />
          ) : !data?.length ? (
            <EmptyState>No services yet.</EmptyState>
          ) : (
            <ul className="list">
              {data.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{s.title}</strong>
                    <div className="muted small">
                      {s.category} · {labels.pricingModel[s.pricingModel]}
                      {s.startingPrice !== null && ` · from ${money(s.startingPrice)}`}
                      {s.typicalDeliveryDays && ` · ~${s.typicalDeliveryDays} days`}
                    </div>
                    {s.description && <p className="small">{s.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Add a service">
          <form
            className="stack"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              add.mutate()
            }}
          >
            <Field label="Category">
              <select value={form.category} onChange={set('category')}>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <input required value={form.title} onChange={set('title')} placeholder="3 Instagram reels + stories" />
            </Field>
            <Field label="Pricing model">
              <select
                value={form.pricingModel}
                onChange={(e) => setForm({ ...form, pricingModel: Number(e.target.value) as PricingModel })}
              >
                {optionsOf(PricingModel).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="form-grid">
              <Field label="Starting price (₹)">
                <input type="number" min={0} value={form.startingPrice} onChange={set('startingPrice')} />
              </Field>
              <Field label="Typical delivery (days)">
                <input type="number" min={1} value={form.typicalDeliveryDays} onChange={set('typicalDeliveryDays')} />
              </Field>
            </div>
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={set('description')} />
            </Field>
            <button className="btn primary" disabled={add.isPending}>
              Add service
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
