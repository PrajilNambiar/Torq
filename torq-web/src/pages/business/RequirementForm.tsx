import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requirementsApi } from '../../api'
import {
  Alert,
  Card,
  DateField,
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

  const set = (key: keyof FormState) => (value: string) => setForm({ ...form, [key]: value })
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
          <FormGrid>
            <TextBox
              label="Campaign title"
              required
              maxLength={200}
              value={form.title}
              onChange={set('title')}
              placeholder="Create 5 Instagram reels for new café launch"
            />
            <Select
              label="Marketing category"
              required
              value={form.category}
              onChange={set('category')}
              options={serviceCategoryOptions()}
            />
            <TextArea
              label="Goal"
              required
              value={form.goal}
              onChange={set('goal')}
              placeholder="Reach local customers and increase store visits"
            />
            <TextArea
              label="Expected deliverables"
              required
              value={form.expectedDeliverables}
              onChange={set('expectedDeliverables')}
              placeholder="5 reels, 10 stories, 1 collaboration post"
            />
          </FormGrid>
        </Card>

        <Card title="Audience">
          <FormGrid>
            <TextBox
              label="Target audience"
              value={form.targetAudience}
              onChange={set('targetAudience')}
              placeholder="Age 18–35, within 15 km, food/lifestyle interest"
            />
            <TextBox label="Location" value={form.location} onChange={set('location')} placeholder="Kochi" />
            <TextBox
              label="Languages"
              hint="Comma separated"
              required
              value={form.languages}
              onChange={set('languages')}
              placeholder="Malayalam, English"
            />
            <TextBox
              label="How will you choose?"
              value={form.selectionPreference}
              onChange={set('selectionPreference')}
              placeholder="Audience match + content quality + price"
            />
          </FormGrid>
        </Card>

        <Card title="Budget and timeline">
          <FormGrid>
            <TextBox
              label="Budget from (₹)"
              type="number"
              min={0}
              value={form.budgetMin}
              onChange={set('budgetMin')}
              placeholder="50000"
            />
            <TextBox
              label="Budget up to (₹)"
              type="number"
              min={0}
              value={form.budgetMax}
              onChange={set('budgetMax')}
              placeholder="80000"
            />
            <TextBox
              label="Timeline (days)"
              type="number"
              min={1}
              value={form.timelineDays}
              onChange={set('timelineDays')}
              placeholder="28"
            />
            <DateField label="Proposal deadline" value={form.proposalDeadlineAt} onChange={set('proposalDeadlineAt')} />
            <TextArea
              label="Timeline notes"
              rows={2}
              value={form.timelineNotes}
              onChange={set('timelineNotes')}
              placeholder="Launch is on the 15th; reels needed a week before."
            />
          </FormGrid>
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
