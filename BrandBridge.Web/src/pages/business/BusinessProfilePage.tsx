import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { UpdateBusinessRequest } from '../../api/types'

export function BusinessProfilePage() {
  const [form, setForm] = useState<UpdateBusinessRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const biz = await api.getBusiness()
        if (!cancelled) {
          setForm({
            legalName: biz.legalName,
            displayName: biz.displayName,
            industry: biz.industry,
            description: biz.description,
            website: biz.website,
            headquartersCity: biz.headquartersCity,
            headquartersRegion: biz.headquartersRegion,
            gstin: null,
            billingEmail: null,
          })
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load profile')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      await api.updateBusiness(form)
      setOk('Profile saved.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  if (!form && !error) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <h1>Business profile</h1>
          <p className="muted">Shown to providers in the hiring flow.</p>
        </div>
      </div>
      {form && (
        <form className="panel stack" onSubmit={onSubmit}>
          {error && <div className="alert">{error}</div>}
          {ok && <div className="alert alert-ok">{ok}</div>}
          <div className="form-grid">
            <label className="field">
              Legal name
              <input
                required
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
              />
            </label>
            <label className="field">
              Display name
              <input
                required
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </label>
            <label className="field">
              Industry
              <input
                value={form.industry ?? ''}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </label>
            <label className="field">
              Website
              <input
                value={form.website ?? ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>
            <label className="field full">
              Description
              <textarea
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="field">
              City
              <input
                value={form.headquartersCity ?? ''}
                onChange={(e) => setForm({ ...form, headquartersCity: e.target.value })}
              />
            </label>
            <label className="field">
              Region
              <input
                value={form.headquartersRegion ?? ''}
                onChange={(e) => setForm({ ...form, headquartersRegion: e.target.value })}
              />
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}
    </div>
  )
}
