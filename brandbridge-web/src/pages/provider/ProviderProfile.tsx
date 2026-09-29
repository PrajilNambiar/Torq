import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Alert, Card, ErrorBox, Field, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { ProviderStatus, ProviderType, SERVICE_CATEGORIES, optionsOf } from '../../types/enums'
import type { ProviderDto } from '../../types/api'
import { blank, num } from '../../lib/format'
import { VerificationBanner } from './VerificationBanner'

const empty = {
  providerType: ProviderType.Creator as ProviderType,
  headline: '',
  bio: '',
  city: '',
  region: '',
  languages: 'English',
  categories: [] as string[],
  minRate: '',
  maxRate: '',
  availability: '',
}

export function ProviderProfile() {
  const { data, isLoading, error } = useQuery({ queryKey: ['provider'], queryFn: providersApi.get })

  return (
    <>
      <PageHeader title="Your profile" subtitle={data && <StatusBadge kind="provider" status={data.status} />} />
      <VerificationBanner provider={data} />
      <ErrorBox error={error} />
      {data?.status === ProviderStatus.Verified && (
        <Alert tone="warn">Saving changes sends your profile back for verification.</Alert>
      )}
      {isLoading ? <Spinner /> : data && <ProviderProfileForm key={data.id} initial={data} />}
    </>
  )
}

function ProviderProfileForm({ initial }: { initial: ProviderDto }) {
  const toast = useToast()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    ...empty,
    providerType: initial.providerType,
    headline: initial.headline ?? '',
    bio: initial.bio ?? '',
    city: initial.city ?? '',
    region: initial.region ?? '',
    languages: initial.languages || 'English',
    categories: initial.serviceCategories
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
  })

  const save = useMutation({
    mutationFn: () =>
      providersApi.update({
        providerType: form.providerType,
        headline: blank(form.headline),
        bio: blank(form.bio),
        city: blank(form.city),
        region: blank(form.region),
        languages: form.languages.trim(),
        serviceCategories: form.categories.join(','),
        minRate: num(form.minRate),
        maxRate: num(form.maxRate),
        availability: blank(form.availability),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['provider'], updated)
      toast.success('Profile saved and sent for verification.')
    },
    onError: toast.error,
  })

  const set = (key: 'headline' | 'bio' | 'city' | 'region' | 'languages' | 'minRate' | 'maxRate' | 'availability') =>
    (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })
  const toggle = (category: string) =>
    setForm({
      ...form,
      categories: form.categories.includes(category)
        ? form.categories.filter((c) => c !== category)
        : [...form.categories, category],
    })

  return (
    <>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          if (form.categories.length === 0) {
            toast.error(new Error('Choose at least one service category.'))
            return
          }
          save.mutate()
        }}
      >
        <Card title="About you">
          <div className="form-grid">
            <Field label="I am a">
              <select
                value={form.providerType}
                onChange={(e) => setForm({ ...form, providerType: Number(e.target.value) as ProviderType })}
              >
                {optionsOf(ProviderType).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Headline" hint="Shown on every proposal you send.">
              <input value={form.headline} onChange={set('headline')} placeholder="Food & lifestyle creator in Kochi" />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={set('city')} />
            </Field>
            <Field label="Region / state">
              <input value={form.region} onChange={set('region')} />
            </Field>
            <Field label="Languages" hint="Comma separated">
              <input required value={form.languages} onChange={set('languages')} />
            </Field>
            <Field label="Availability">
              <input value={form.availability} onChange={set('availability')} placeholder="2 campaigns per month" />
            </Field>
            <Field label="Bio">
              <textarea rows={4} value={form.bio} onChange={set('bio')} />
            </Field>
          </div>
        </Card>

        <Card title="What you offer">
          <fieldset className="checks">
            <legend className="field-label">Service categories — you'll only see requirements in these categories.</legend>
            {SERVICE_CATEGORIES.map((c) => (
              <label key={c} className="check">
                <input type="checkbox" checked={form.categories.includes(c)} onChange={() => toggle(c)} />
                {c}
              </label>
            ))}
          </fieldset>
          <div className="form-grid">
            <Field label="Typical minimum rate (₹)">
              <input type="number" min={0} value={form.minRate} onChange={set('minRate')} />
            </Field>
            <Field label="Typical maximum rate (₹)">
              <input type="number" min={0} value={form.maxRate} onChange={set('maxRate')} />
            </Field>
          </div>
        </Card>

        <div className="form-actions">
          <button className="btn primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </>
  )
}
