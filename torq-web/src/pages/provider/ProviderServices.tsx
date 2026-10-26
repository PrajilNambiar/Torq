import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api'
import {
  Card,
  EmptyState,
  ErrorBox,
  FormGrid,
  PageHeader,
  Select,
  Spinner,
  TextArea,
  TextBox,
  serviceCategoryOptions,
} from '../../components/ui'
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
            <Select
              label="Category"
              required
              value={form.category}
              onChange={(category) => setForm({ ...form, category })}
              options={serviceCategoryOptions()}
            />
            <TextBox
              label="Title"
              required
              value={form.title}
              onChange={(title) => setForm({ ...form, title })}
              placeholder="3 Instagram reels + stories"
            />
            <Select
              label="Pricing model"
              value={form.pricingModel}
              onChange={(pricingModel) => setForm({ ...form, pricingModel })}
              options={optionsOf(PricingModel).map((o) => ({ value: o.value as PricingModel, label: o.label }))}
            />
            <FormGrid>
              <TextBox
                label="Starting price (₹)"
                type="number"
                min={0}
                value={form.startingPrice}
                onChange={(startingPrice) => setForm({ ...form, startingPrice })}
              />
              <TextBox
                label="Typical delivery (days)"
                type="number"
                min={1}
                value={form.typicalDeliveryDays}
                onChange={(typicalDeliveryDays) => setForm({ ...form, typicalDeliveryDays })}
              />
            </FormGrid>
            <TextArea
              label="Description"
              value={form.description}
              onChange={(description) => setForm({ ...form, description })}
            />
            <button className="btn primary" disabled={add.isPending}>
              Add service
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}
