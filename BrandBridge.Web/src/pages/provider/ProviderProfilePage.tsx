import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { PortfolioItemDto, ProviderServiceDto, UpdateProviderRequest } from '../../api/types'
import { PricingModel, ProviderStatus, ProviderType } from '../../api/types'
import { StatusChip } from '../../components/StatusChip'
import { providerStatusLabel } from '../../lib/labels'

export function ProviderProfilePage() {
  const [form, setForm] = useState<UpdateProviderRequest | null>(null)
  const [status, setStatus] = useState<ProviderStatus | null>(null)
  const [services, setServices] = useState<ProviderServiceDto[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItemDto[]>([])
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceCategory, setServiceCategory] = useState('ugc')
  const [portfolioTitle, setPortfolioTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function reload() {
    const [me, svc, port] = await Promise.all([
      api.getProvider(),
      api.listServices(),
      api.listPortfolio(),
    ])
    setStatus(me.status)
    setForm({
      providerType: me.providerType || ProviderType.Freelancer,
      headline: me.headline,
      bio: me.bio,
      city: me.city,
      region: me.region,
      languages: me.languages || 'en',
      serviceCategories: me.serviceCategories || 'social',
      minRate: null,
      maxRate: null,
      availability: null,
    })
    setServices(svc)
    setPortfolio(port)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await reload()
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load')
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
      await api.updateProvider(form)
      setOk('Profile saved. Verification may move to pending.')
      await reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function addService(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.addService({
        category: serviceCategory,
        title: serviceTitle,
        description: null,
        startingPrice: 10000,
        pricingModel: PricingModel.Fixed,
        typicalDeliveryDays: 14,
      })
      setServiceTitle('')
      await reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add service')
    } finally {
      setBusy(false)
    }
  }

  async function addPortfolio(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.addPortfolio({
        title: portfolioTitle,
        description: null,
        clientOrIndustry: null,
        mediaUrl: null,
        metricsEvidence: null,
      })
      setPortfolioTitle('')
      await reload()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add portfolio item')
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
    <div className="page stack-lg">
      <div className="section-head">
        <div>
          <h1>Provider profile</h1>
          <p className="muted">Headline, services, and portfolio drive matching and verification.</p>
        </div>
        {status != null && (
          <StatusChip
            label={providerStatusLabel[status]}
            tone={status === ProviderStatus.Verified ? 'teal' : 'amber'}
          />
        )}
      </div>

      {form && (
        <form className="panel stack" onSubmit={onSubmit}>
          {error && <div className="alert">{error}</div>}
          {ok && <div className="alert alert-ok">{ok}</div>}
          <div className="form-grid">
            <label className="field">
              Type
              <select
                value={form.providerType}
                onChange={(e) =>
                  setForm({ ...form, providerType: Number(e.target.value) as ProviderType })
                }
              >
                <option value={ProviderType.Freelancer}>Freelancer</option>
                <option value={ProviderType.Creator}>Creator</option>
                <option value={ProviderType.Influencer}>Influencer</option>
                <option value={ProviderType.Specialist}>Specialist</option>
                <option value={ProviderType.Agency}>Agency</option>
              </select>
            </label>
            <label className="field">
              Languages
              <input
                required
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
              />
            </label>
            <label className="field full">
              Headline
              <input
                value={form.headline ?? ''}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
              />
            </label>
            <label className="field full">
              Bio
              <textarea
                value={form.bio ?? ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </label>
            <label className="field">
              City
              <input
                value={form.city ?? ''}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label className="field">
              Service categories
              <input
                required
                value={form.serviceCategories}
                onChange={(e) => setForm({ ...form, serviceCategories: e.target.value })}
              />
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>Services</h2>
        <ul>
          {services.map((s) => (
            <li key={s.id}>
              {s.title} · {s.category}
            </li>
          ))}
        </ul>
        <form className="row" onSubmit={addService}>
          <label className="field">
            Category
            <input value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} />
          </label>
          <label className="field" style={{ flex: 1 }}>
            Title
            <input required value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} />
          </label>
          <button className="btn btn-ghost" type="submit" disabled={busy}>
            Add
          </button>
        </form>
      </section>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>Portfolio</h2>
        <ul>
          {portfolio.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
        <form className="row" onSubmit={addPortfolio}>
          <label className="field" style={{ flex: 1 }}>
            Title
            <input
              required
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
            />
          </label>
          <button className="btn btn-ghost" type="submit" disabled={busy}>
            Add
          </button>
        </form>
      </section>
    </div>
  )
}
