import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { businessApi } from '../../api'
import { Card, ErrorBox, Field, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import type { BusinessDto } from '../../types/api'
import { blank } from '../../lib/format'

export function BusinessProfile() {
  const { data, isLoading, error } = useQuery({ queryKey: ['business'], queryFn: businessApi.get })

  return (
    <>
      <PageHeader title="Business profile" subtitle="Providers see this when they review your requirements." />
      <ErrorBox error={error} />
      {isLoading ? <Spinner /> : data && <BusinessProfileForm key={data.id} initial={data} />}
    </>
  )
}

function BusinessProfileForm({ initial }: { initial: BusinessDto }) {
  const toast = useToast()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    legalName: initial.legalName,
    displayName: initial.displayName,
    industry: initial.industry ?? '',
    description: initial.description ?? '',
    website: initial.website ?? '',
    headquartersCity: initial.headquartersCity ?? '',
    headquartersRegion: initial.headquartersRegion ?? '',
    gstin: '',
    billingEmail: '',
  })

  const save = useMutation({
    mutationFn: () =>
      businessApi.update({
        legalName: form.legalName,
        displayName: form.displayName,
        industry: blank(form.industry),
        description: blank(form.description),
        website: blank(form.website),
        headquartersCity: blank(form.headquartersCity),
        headquartersRegion: blank(form.headquartersRegion),
        gstin: blank(form.gstin),
        billingEmail: blank(form.billingEmail),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['business'], updated)
      toast.success('Business profile saved.')
    },
    onError: toast.error,
  })

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })

  return (
    <Card>
      <form
        className="form-grid"
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        <Field label="Legal name">
          <input required value={form.legalName} onChange={set('legalName')} />
        </Field>
        <Field label="Display name">
          <input required value={form.displayName} onChange={set('displayName')} />
        </Field>
        <Field label="Industry">
          <input value={form.industry} onChange={set('industry')} placeholder="Food & beverage" />
        </Field>
        <Field label="Website">
          <input value={form.website} onChange={set('website')} placeholder="https://" />
        </Field>
        <Field label="City">
          <input value={form.headquartersCity} onChange={set('headquartersCity')} placeholder="Kochi" />
        </Field>
        <Field label="Region / state">
          <input value={form.headquartersRegion} onChange={set('headquartersRegion')} placeholder="Kerala" />
        </Field>
        <Field label="GSTIN" hint="Optional, used for invoices.">
          <input value={form.gstin} onChange={set('gstin')} />
        </Field>
        <Field label="Billing email">
          <input type="email" value={form.billingEmail} onChange={set('billingEmail')} />
        </Field>
        <Field label="About the business">
          <textarea rows={4} value={form.description} onChange={set('description')} />
        </Field>
        <div className="form-actions">
          <button className="btn primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </Card>
  )
}
