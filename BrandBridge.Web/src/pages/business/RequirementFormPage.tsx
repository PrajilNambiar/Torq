import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { CreateRequirementRequest } from '../../api/types'

const empty: CreateRequirementRequest = {
  title: '',
  category: 'social',
  goal: '',
  targetAudience: '',
  location: '',
  languages: 'en',
  expectedDeliverables: '',
  budgetMin: null,
  budgetMax: null,
  timelineDays: 30,
  timelineNotes: '',
  selectionPreference: '',
  proposalDeadlineAt: null,
}

export function RequirementFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CreateRequirementRequest>(empty)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function set<K extends keyof CreateRequirementRequest>(key: K, value: CreateRequirementRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const created = await api.createRequirement({
        ...form,
        budgetMin: form.budgetMin === null || Number.isNaN(Number(form.budgetMin)) ? null : Number(form.budgetMin),
        budgetMax: form.budgetMax === null || Number.isNaN(Number(form.budgetMax)) ? null : Number(form.budgetMax),
        timelineDays: form.timelineDays === null || Number.isNaN(Number(form.timelineDays)) ? null : Number(form.timelineDays),
        targetAudience: form.targetAudience || null,
        location: form.location || null,
        timelineNotes: form.timelineNotes || null,
        selectionPreference: form.selectionPreference || null,
      })
      navigate(`/business/requirements/${created.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create requirement')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <h1>New brief</h1>
          <p className="muted">Saved as a draft. Submit when you’re ready for admin review.</p>
        </div>
      </div>
      <form className="panel stack" onSubmit={onSubmit}>
        {error && <div className="alert">{error}</div>}
        <div className="form-grid">
          <label className="field full">
            Title
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} />
          </label>
          <label className="field">
            Category
            <input required value={form.category} onChange={(e) => set('category', e.target.value)} />
          </label>
          <label className="field">
            Languages
            <input required value={form.languages} onChange={(e) => set('languages', e.target.value)} />
          </label>
          <label className="field full">
            Goal
            <textarea required value={form.goal} onChange={(e) => set('goal', e.target.value)} />
          </label>
          <label className="field full">
            Expected deliverables
            <textarea
              required
              value={form.expectedDeliverables}
              onChange={(e) => set('expectedDeliverables', e.target.value)}
            />
          </label>
          <label className="field">
            Target audience
            <input
              value={form.targetAudience ?? ''}
              onChange={(e) => set('targetAudience', e.target.value)}
            />
          </label>
          <label className="field">
            Location
            <input value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} />
          </label>
          <label className="field">
            Budget min
            <input
              type="number"
              value={form.budgetMin ?? ''}
              onChange={(e) => set('budgetMin', e.target.value === '' ? null : Number(e.target.value))}
            />
          </label>
          <label className="field">
            Budget max
            <input
              type="number"
              value={form.budgetMax ?? ''}
              onChange={(e) => set('budgetMax', e.target.value === '' ? null : Number(e.target.value))}
            />
          </label>
          <label className="field">
            Timeline (days)
            <input
              type="number"
              value={form.timelineDays ?? ''}
              onChange={(e) =>
                set('timelineDays', e.target.value === '' ? null : Number(e.target.value))
              }
            />
          </label>
          <label className="field">
            Selection preference
            <input
              value={form.selectionPreference ?? ''}
              onChange={(e) => set('selectionPreference', e.target.value)}
            />
          </label>
        </div>
        <div className="row">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save draft'}
          </button>
        </div>
      </form>
    </div>
  )
}
