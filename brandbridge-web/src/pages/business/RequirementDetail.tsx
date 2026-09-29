import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsApi, requirementsApi } from '../../api'
import { FileUploader } from '../../components/FileUploader'
import { StatusBadge } from '../../components/StatusBadge'
import { Alert, Card, DefinitionList, ErrorBox, PageHeader, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { RequirementStatus } from '../../types/enums'
import type { AttachFileRequest } from '../../types/api'
import { budget, date, formatBytes } from '../../lib/format'

const statusHelp: Partial<Record<RequirementStatus, string>> = {
  [RequirementStatus.Draft]: 'This is a draft. Submit it for review when it is ready.',
  [RequirementStatus.UnderReview]: 'The BrandBridge team is reviewing your requirement before opening it to providers.',
  [RequirementStatus.Open]: 'Open to verified providers. You will see proposals here as they arrive.',
  [RequirementStatus.ProposalReview]: 'Proposals have arrived. Compare them and choose a provider.',
  [RequirementStatus.ProviderSelected]: 'A provider has been selected. Continue in the campaign workspace.',
  [RequirementStatus.Closed]: 'This campaign is complete.',
  [RequirementStatus.Cancelled]: 'This requirement was not approved or was cancelled.',
}

export function RequirementDetail() {
  const { id } = useParams() as { id: string }
  const toast = useToast()
  const qc = useQueryClient()
  const [pending, setPending] = useState<AttachFileRequest[]>([])

  const req = useQuery({ queryKey: ['requirement', id], queryFn: () => requirementsApi.get(id) })
  const status = req.data?.status
  const hasProposals = status !== undefined && status >= RequirementStatus.Open && status !== RequirementStatus.Cancelled
  const proposals = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => requirementsApi.proposals(id),
    enabled: hasProposals,
  })
  const hasCampaign = status === RequirementStatus.ProviderSelected || status === RequirementStatus.Closed
  const campaigns = useQuery({
    queryKey: ['campaigns', 'all'],
    queryFn: () => campaignsApi.list(1, 50),
    enabled: hasCampaign,
  })
  const campaign = campaigns.data?.items.find((c) => c.requirementId === id)

  const submit = useMutation({
    mutationFn: () => requirementsApi.submit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requirement', id] })
      qc.invalidateQueries({ queryKey: ['requirements'] })
      toast.success('Submitted for review.')
    },
    onError: toast.error,
  })

  const attach = useMutation({
    mutationFn: async () => {
      for (const file of pending) await requirementsApi.attach(id, file)
    },
    onSuccess: () => {
      setPending([])
      qc.invalidateQueries({ queryKey: ['requirement', id] })
      toast.success('Files attached.')
    },
    onError: toast.error,
  })

  if (req.isLoading) return <Spinner />
  if (req.error || !req.data) {
    return (
      <>
        <PageHeader back="/business/requirements" title="Requirement" />
        <ErrorBox error={req.error} />
      </>
    )
  }
  const r = req.data
  const proposalCount = proposals.data?.length ?? 0

  return (
    <>
      <PageHeader
        back="/business/requirements"
        title={r.title}
        subtitle={
          <>
            <StatusBadge kind="requirement" status={r.status} /> · {r.category} · posted {date(r.createdAt)}
          </>
        }
        actions={
          <>
            {r.status === RequirementStatus.Draft && (
              <>
                <Link to={`/business/requirements/${id}/edit`} className="btn ghost">
                  Edit
                </Link>
                <button className="btn primary" disabled={submit.isPending} onClick={() => submit.mutate()}>
                  Submit for review
                </button>
              </>
            )}
            {hasProposals && !hasCampaign && (
              <Link to={`/business/requirements/${id}/proposals`} className="btn primary">
                Compare proposals ({proposalCount})
              </Link>
            )}
            {campaign && (
              <Link to={`/campaigns/${campaign.id}`} className="btn primary">
                Open campaign workspace
              </Link>
            )}
          </>
        }
      />

      {statusHelp[r.status] && <Alert>{statusHelp[r.status]}</Alert>}

      <div className="grid-2">
        <Card title="Brief">
          <DefinitionList
            items={[
              ['Goal', r.goal],
              ['Expected deliverables', r.expectedDeliverables],
              ['Target audience', r.targetAudience],
              ['Location', r.location],
              ['Languages', r.languages],
              ['Selection preference', r.selectionPreference],
            ]}
          />
        </Card>
        <Card title="Budget and timeline">
          <DefinitionList
            items={[
              ['Budget', budget(r.budgetMin, r.budgetMax, r.currency)],
              ['Timeline', r.timelineDays ? `${r.timelineDays} days` : null],
              ['Timeline notes', r.timelineNotes],
              ['Proposal deadline', date(r.proposalDeadlineAt)],
              ['Proposals received', hasProposals ? proposalCount : null],
            ]}
          />
        </Card>
      </div>

      <Card title="Reference material">
        {r.assets.length === 0 ? (
          <p className="muted">No files yet. Add product photos, brand guides or sample content.</p>
        ) : (
          <ul className="file-list">
            {r.assets.map((a) => (
              <li key={a.id}>
                <span>{a.fileName}</span>
                <span className="muted">{formatBytes(a.sizeBytes)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="row">
          <FileUploader files={pending} onChange={setPending} label="Add files" />
          {pending.length > 0 && (
            <button className="btn primary" disabled={attach.isPending} onClick={() => attach.mutate()}>
              Attach {pending.length} file{pending.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </Card>
    </>
  )
}
