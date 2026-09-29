import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { proposalsApi, providersApi, requirementsApi } from '../../api'
import { StatusBadge } from '../../components/StatusBadge'
import { Alert, Card, DefinitionList, ErrorBox, Field, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { PricingModel, ProposalStatus, optionsOf } from '../../types/enums'
import type { ProposalDto, ProposalMilestoneDto } from '../../types/api'
import { blank, budget, date, money, num } from '../../lib/format'

interface MilestoneRow {
  title: string
  amount: string
  dueDate: string
}

const empty = {
  pricingModel: PricingModel.Fixed as PricingModel,
  priceAmount: '',
  scopeOfWork: '',
  deliverables: '',
  timelineDays: '',
  timelineNotes: '',
  expectedMetrics: '',
  revisionsIncluded: '2',
  clientRequirements: '',
  optionalAddOns: '',
  coverNote: '',
}

type TextKey = Exclude<keyof typeof empty, 'pricingModel'>

/** Structured proposal form. Submitting again updates the same proposal. */
export function ProposalBuilder() {
  const { id } = useParams() as { id: string }
  const toast = useToast()
  const qc = useQueryClient()
  const [form, setForm] = useState(empty)
  const [milestones, setMilestones] = useState<MilestoneRow[]>([])
  const [portfolioIds, setPortfolioIds] = useState<string[]>([])
  const [saved, setSaved] = useState<ProposalDto | null>(null)

  const req = useQuery({ queryKey: ['requirement', id], queryFn: () => requirementsApi.get(id) })
  const portfolio = useQuery({ queryKey: ['portfolio'], queryFn: providersApi.portfolio })

  const milestoneTotal = milestones.reduce((sum, m) => sum + (num(m.amount) ?? 0), 0)
  const price = num(form.priceAmount) ?? 0
  const milestoneMismatch = milestones.length > 0 && Math.abs(milestoneTotal - price) > 0.01

  const upsert = useMutation({
    mutationFn: (submit: boolean) => {
      const ms: ProposalMilestoneDto[] = milestones.map((m, i) => ({
        sortOrder: i + 1,
        title: m.title.trim(),
        amount: num(m.amount) ?? 0,
        dueDate: m.dueDate || null,
      }))
      return proposalsApi.upsert({
        requirementId: id,
        pricingModel: form.pricingModel,
        priceAmount: price,
        scopeOfWork: form.scopeOfWork.trim(),
        deliverables: form.deliverables.trim(),
        timelineDays: num(form.timelineDays) ?? 0,
        timelineNotes: blank(form.timelineNotes),
        expectedMetrics: blank(form.expectedMetrics),
        revisionsIncluded: num(form.revisionsIncluded) ?? 0,
        clientRequirements: blank(form.clientRequirements),
        optionalAddOns: blank(form.optionalAddOns),
        coverNote: blank(form.coverNote),
        submit,
        milestones: ms.length ? ms : null,
        portfolioItemIds: portfolioIds,
      })
    },
    onSuccess: (proposal) => {
      setSaved(proposal)
      qc.invalidateQueries({ queryKey: ['opportunities'] })
      toast.success(proposal.status === ProposalStatus.Draft ? 'Draft saved.' : 'Proposal submitted to the business.')
    },
    onError: toast.error,
  })

  const withdraw = useMutation({
    mutationFn: () => proposalsApi.withdraw(saved!.id),
    onSuccess: () => {
      setSaved((p) => (p ? { ...p, status: ProposalStatus.Withdrawn } : p))
      toast.success('Proposal withdrawn.')
    },
    onError: toast.error,
  })

  if (req.isLoading) return <Spinner />
  if (req.error || !req.data) {
    return (
      <>
        <PageHeader back="/provider/opportunities" title="Opportunity" />
        <ErrorBox error={req.error} />
      </>
    )
  }
  const r = req.data
  const locked = saved?.status === ProposalStatus.Withdrawn

  const set = (key: TextKey) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })
  const setMs = (i: number, key: keyof MilestoneRow, value: string) =>
    setMilestones(milestones.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)))

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    upsert.mutate(submitter?.value === 'submit')
  }

  return (
    <>
      <PageHeader
        back="/provider/opportunities"
        title={r.title}
        subtitle={`${r.category} · ${budget(r.budgetMin, r.budgetMax, r.currency)} · proposals due ${date(r.proposalDeadlineAt)}`}
      />

      <div className="split">
        <Card title="The brief" className="sticky-card">
          <DefinitionList
            items={[
              ['Goal', r.goal],
              ['Expected deliverables', r.expectedDeliverables],
              ['Target audience', r.targetAudience],
              ['Location', r.location],
              ['Languages', r.languages],
              ['Timeline', r.timelineDays ? `${r.timelineDays} days` : null],
              ['Timeline notes', r.timelineNotes],
              ['How they will choose', r.selectionPreference],
            ]}
          />
        </Card>

        <form onSubmit={onSubmit}>
          {saved && (
            <Alert tone={saved.status === ProposalStatus.Withdrawn ? 'warn' : 'success'}>
              Proposal status: <StatusBadge kind="proposal" status={saved.status} />
              {saved.status !== ProposalStatus.Withdrawn && ' — you can keep editing and resubmit.'}
            </Alert>
          )}

          <Card title="Price and timeline">
            <div className="form-grid">
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
              <Field label="Total price (₹)">
                <input type="number" min={1} required value={form.priceAmount} onChange={set('priceAmount')} />
              </Field>
              <Field label="Timeline (days)">
                <input type="number" min={1} required value={form.timelineDays} onChange={set('timelineDays')} />
              </Field>
              <Field label="Revisions included">
                <input type="number" min={0} value={form.revisionsIncluded} onChange={set('revisionsIncluded')} />
              </Field>
            </div>
            <Field label="Timeline notes">
              <input value={form.timelineNotes} onChange={set('timelineNotes')} />
            </Field>
          </Card>

          <Card title="Scope">
            <Field label="Scope of work">
              <textarea required rows={4} value={form.scopeOfWork} onChange={set('scopeOfWork')} />
            </Field>
            <Field label="Exact deliverables">
              <textarea required rows={3} value={form.deliverables} onChange={set('deliverables')} placeholder="5 reels (30–45s), 10 stories, 1 collab post" />
            </Field>
            <Field label="Expected metrics" hint="Estimates, not guarantees.">
              <input value={form.expectedMetrics} onChange={set('expectedMetrics')} />
            </Field>
            <Field label="What you need from the client">
              <textarea rows={2} value={form.clientRequirements} onChange={set('clientRequirements')} placeholder="Product samples, brand guide, store access" />
            </Field>
            <Field label="Optional add-ons">
              <textarea rows={2} value={form.optionalAddOns} onChange={set('optionalAddOns')} />
            </Field>
          </Card>

          <Card
            title="Milestones"
            actions={
              <button type="button" className="btn ghost small" onClick={() => setMilestones([...milestones, { title: '', amount: '', dueDate: '' }])}>
                + Add milestone
              </button>
            }
          >
            {milestones.length === 0 ? (
              <p className="muted small">Without milestones, the whole price is paid as a single delivery milestone.</p>
            ) : (
              <>
                {milestones.map((m, i) => (
                  <div key={i} className="ms-row">
                    <span className="step-no">{i + 1}</span>
                    <input aria-label="Milestone title" required placeholder="Concept + script" value={m.title} onChange={(e) => setMs(i, 'title', e.target.value)} />
                    <input aria-label="Amount" required type="number" min={1} placeholder="Amount" value={m.amount} onChange={(e) => setMs(i, 'amount', e.target.value)} />
                    <input aria-label="Due date" type="date" value={m.dueDate} onChange={(e) => setMs(i, 'dueDate', e.target.value)} />
                    <button type="button" className="link" onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}>
                      Remove
                    </button>
                  </div>
                ))}
                <p className={milestoneMismatch ? 'error-text small' : 'muted small'}>
                  Milestones total {money(milestoneTotal)} of {money(price)}
                  {milestoneMismatch && ' — should match the total price.'}
                </p>
              </>
            )}
          </Card>

          <Card title="Relevant portfolio">
            {!portfolio.data?.length ? (
              <p className="muted small">
                <Link to="/provider/portfolio">Add portfolio items</Link> to show relevant past work.
              </p>
            ) : (
              <div className="checks">
                {portfolio.data.map((p) => (
                  <label key={p.id} className="check">
                    <input
                      type="checkbox"
                      checked={portfolioIds.includes(p.id)}
                      onChange={() =>
                        setPortfolioIds(portfolioIds.includes(p.id) ? portfolioIds.filter((x) => x !== p.id) : [...portfolioIds, p.id])
                      }
                    />
                    {p.title}
                    {p.clientOrIndustry && <span className="muted small"> · {p.clientOrIndustry}</span>}
                  </label>
                ))}
              </div>
            )}
          </Card>

          <Card title="Cover note">
            <textarea rows={4} aria-label="Cover note" value={form.coverNote} onChange={set('coverNote')} placeholder="Why you're a good fit for this brief." />
            <p className="muted small">Don't include phone numbers or emails — all communication happens in the campaign workspace.</p>
          </Card>

          <div className="form-actions sticky">
            {saved && saved.status !== ProposalStatus.Withdrawn && (
              <button type="button" className="btn danger ghost" disabled={withdraw.isPending} onClick={() => withdraw.mutate()}>
                Withdraw
              </button>
            )}
            <button type="submit" value="draft" className="btn ghost" disabled={upsert.isPending || locked}>
              Save draft
            </button>
            <button type="submit" value="submit" className="btn primary" disabled={upsert.isPending || locked || milestoneMismatch}>
              {upsert.isPending ? 'Sending…' : 'Submit proposal'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
