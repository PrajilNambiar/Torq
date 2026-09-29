import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import { PricingModel } from '../../api/types'

export function ProposalFormPage() {
  const { id: requirementId = '' } = useParams()
  const navigate = useNavigate()
  const [priceAmount, setPriceAmount] = useState(50000)
  const [timelineDays, setTimelineDays] = useState(28)
  const [revisionsIncluded, setRevisionsIncluded] = useState(1)
  const [scopeOfWork, setScopeOfWork] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [coverNote, setCoverNote] = useState('')
  const [milestoneTitle, setMilestoneTitle] = useState('Delivery')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function save(submit: boolean) {
    setBusy(true)
    setError(null)
    try {
      await api.upsertProposal({
        requirementId,
        pricingModel: PricingModel.Milestone,
        priceAmount,
        scopeOfWork,
        deliverables,
        timelineDays,
        timelineNotes: null,
        expectedMetrics: null,
        revisionsIncluded,
        clientRequirements: null,
        optionalAddOns: null,
        coverNote,
        submit,
        milestones: [
          {
            sortOrder: 1,
            title: milestoneTitle || 'Delivery',
            description: deliverables,
            amount: priceAmount,
            dueDate: null,
          },
        ],
        portfolioItemIds: null,
      })
      navigate('/provider')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save proposal')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void save(true)
  }

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <h1>Submit proposal</h1>
          <p className="muted">Pitch scope, price, and a milestone plan.</p>
        </div>
        <Link className="btn btn-ghost" to="/provider">
          Back
        </Link>
      </div>
      <form className="panel stack" onSubmit={onSubmit}>
        {error && <div className="alert">{error}</div>}
        <div className="form-grid">
          <label className="field">
            Price
            <input
              type="number"
              required
              value={priceAmount}
              onChange={(e) => setPriceAmount(Number(e.target.value))}
            />
          </label>
          <label className="field">
            Timeline (days)
            <input
              type="number"
              required
              value={timelineDays}
              onChange={(e) => setTimelineDays(Number(e.target.value))}
            />
          </label>
          <label className="field">
            Revisions included
            <input
              type="number"
              required
              value={revisionsIncluded}
              onChange={(e) => setRevisionsIncluded(Number(e.target.value))}
            />
          </label>
          <label className="field">
            Milestone title
            <input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} />
          </label>
          <label className="field full">
            Cover note
            <textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} />
          </label>
          <label className="field full">
            Scope of work
            <textarea required value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} />
          </label>
          <label className="field full">
            Deliverables
            <textarea
              required
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
            />
          </label>
        </div>
        <div className="row">
          <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => void save(false)}>
            Save draft
          </button>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit proposal'}
          </button>
        </div>
      </form>
    </div>
  )
}
