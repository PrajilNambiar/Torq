import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requirementsApi } from '../../api'
import { Alert, Card, ErrorBox, Field, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { RequirementStatus, SERVICE_CATEGORIES } from '../../types/enums'
import type { CreateRequirementRequest, RequirementDto } from '../../types/api'
import { blank, num } from '../../lib/format'

const empty = {
  title: '',
  category: SERVICE_CATEGORIES[0] as string,
  goal: '',
  targetAudience: '',
  location: '',
  languages: 'English',
  expectedDeliverables: '',
  budgetMin: '',
  budgetMax: '',
  timelineDays: '',
  timelineNotes: '',
  selectionPreference: '',
  proposalDeadlineAt: '',
}

type FormState = typeof empty

function toRequest(f: FormState): CreateRequirementRequest {
  return {
    title: f.title.trim(),
    category: f.category,
    goal: f.goal.trim(),
    targetAudience: blank(f.targetAudience),
    location: blank(f.location),
    languages: f.languages.trim(),
    expectedDeliverables: f.expectedDeliverables.trim(),
    budgetMin: num(f.budgetMin),
    budgetMax: num(f.budgetMax),
    timelineDays: num(f.timelineDays),
    timelineNotes: blank(f.timelineNotes),
    selectionPreference: blank(f.selectionPreference),
    proposalDeadlineAt: f.proposalDeadlineAt ? new Date(f.proposalDeadlineAt).toISOString() : null,
  }
}

function fromDto(r: RequirementDto): FormState {
  return {
    title: r.title,
    category: r.category,
    goal: r.goal,
    targetAudience: r.targetAudience ?? '',
    location: r.location ?? '',
    languages: r.languages,
    expectedDeliverables: r.expectedDeliverables,
    budgetMin: r.budgetMin?.toString() ?? '',
    budgetMax: r.budgetMax?.toString() ?? '',
    timelineDays: r.timelineDays?.toString() ?? '',
    timelineNotes: r.timelineNotes ?? '',
    selectionPreference: r.selectionPreference ?? '',
    proposalDeadlineAt: r.proposalDeadlineAt ? r.proposalDeadlineAt.slice(0, 10) : '',
  }
}

/** Create a new requirement or edit a draft one. */
export function RequirementForm() {
  const { id } = useParams()
  const existing = useQuery({
    queryKey: ['requirement', id],
    queryFn: () => requirementsApi.get(id!),
    enabled: Boolean(id),
  })

  if (!id) return <RequirementFormBody initial={empty} />
  if (existing.isLoading) return <Spinner />
  if (!existing.data || existing.data.status !== RequirementStatus.Draft) {
    return (
      <>
        <PageHeader back={`/business/requirements/${id}`} title="Edit requirement" />
        {existing.data ? <Alert tone="warn">Only draft requirements can be edited.</Alert> : <ErrorBox error={existing.error} />}
      </>
    )
  }
  return <RequirementFormBody key={id} id={id} initial={fromDto(existing.data)} />
}

function RequirementFormBody({ id, initial }: { id?: string; initial: FormState }) {
  const editing = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>(initial)

  const save = useMutation({
    mutationFn: async (submitForReview: boolean) => {
      const body = toRequest(form)
      const saved = editing ? await requirementsApi.update(id!, body) : await requirementsApi.create(body)
      if (submitForReview) await requirementsApi.submit(saved.id)
      return { saved, submitForReview }
    },
    onSuccess: ({ saved, submitForReview }) => {
      qc.invalidateQueries({ queryKey: ['requirements'] })
      qc.invalidateQueries({ queryKey: ['requirement', saved.id] })
      toast.success(submitForReview ? 'Submitted for review. Our team will open it to providers shortly.' : 'Draft saved.')
      navigate(`/business/requirements/${saved.id}`)
    },
    onError: toast.error,
  })

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })
  const budgetInvalid = num(form.budgetMin) !== null && num(form.budgetMax) !== null && num(form.budgetMax)! < num(form.budgetMin)!

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    save.mutate(submitter?.value === 'submit')
  }

  return (
    <>
      <PageHeader
        back={editing ? `/business/requirements/${id}` : '/business/requirements'}
        title={editing ? 'Edit requirement' : 'Post a marketing requirement'}
        subtitle="Explain what you need in plain words. Structured details help providers price accurately."
      />
      <form onSubmit={onSubmit}>
        <Card title="What do you need?">
          <div className="form-grid">
            <Field label="Campaign title">
              <input required maxLength={200} value={form.title} onChange={set('title')} placeholder="Create 5 Instagram reels for new café launch" />
            </Field>
            <Field label="Marketing category">
              <select value={form.category} onChange={set('category')}>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Goal">
              <textarea required rows={3} value={form.goal} onChange={set('goal')} placeholder="Reach local customers and increase store visits" />
            </Field>
            <Field label="Expected deliverables">
              <textarea required rows={3} value={form.expectedDeliverables} onChange={set('expectedDeliverables')} placeholder="5 reels, 10 stories, 1 collaboration post" />
            </Field>
          </div>
        </Card>

        <Card title="Audience">
          <div className="form-grid">
            <Field label="Target audience">
              <input value={form.targetAudience} onChange={set('targetAudience')} placeholder="Age 18–35, within 15 km, food/lifestyle interest" />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={set('location')} placeholder="Kochi" />
            </Field>
            <Field label="Languages" hint="Comma separated">
              <input required value={form.languages} onChange={set('languages')} placeholder="Malayalam, English" />
            </Field>
            <Field label="How will you choose?">
              <input value={form.selectionPreference} onChange={set('selectionPreference')} placeholder="Audience match + content quality + price" />
            </Field>
          </div>
        </Card>

        <Card title="Budget and timeline">
          <div className="form-grid">
            <Field label="Budget from (₹)">
              <input type="number" min={0} value={form.budgetMin} onChange={set('budgetMin')} placeholder="50000" />
            </Field>
            <Field label="Budget up to (₹)">
              <input type="number" min={0} value={form.budgetMax} onChange={set('budgetMax')} placeholder="80000" />
            </Field>
            <Field label="Timeline (days)">
              <input type="number" min={1} value={form.timelineDays} onChange={set('timelineDays')} placeholder="28" />
            </Field>
            <Field label="Proposal deadline">
              <input type="date" value={form.proposalDeadlineAt} onChange={set('proposalDeadlineAt')} />
            </Field>
            <Field label="Timeline notes">
              <textarea rows={2} value={form.timelineNotes} onChange={set('timelineNotes')} placeholder="Launch is on the 15th; reels needed a week before." />
            </Field>
          </div>
          {budgetInvalid && <Alert tone="error">The maximum budget must be at least the minimum.</Alert>}
        </Card>

        <div className="form-actions sticky">
          <span className="muted small">Reference files can be attached after saving.</span>
          <button type="submit" value="draft" className="btn ghost" disabled={save.isPending || budgetInvalid}>
            Save draft
          </button>
          <button type="submit" value="submit" className="btn primary" disabled={save.isPending || budgetInvalid}>
            {save.isPending ? 'Saving…' : 'Submit for review'}
          </button>
        </div>
      </form>
    </>
  )
}
