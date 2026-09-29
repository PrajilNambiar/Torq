import { useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsApi, milestonesApi, requirementsApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import { FileUploader } from '../../components/FileUploader'
import { StatusBadge } from '../../components/StatusBadge'
import { Alert, Card, ErrorBox, Field, PageHeader, Spinner, Stat } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { CampaignStatus, MilestoneStatus, UserRole } from '../../types/enums'
import type { AttachFileRequest, MilestoneDto } from '../../types/api'
import { date, money, shortId } from '../../lib/format'
import { MessageThread } from './MessageThread'

const providerCanSubmit: number[] = [MilestoneStatus.Funded, MilestoneStatus.InProgress, MilestoneStatus.ChangesRequested]
const disputable: number[] = [CampaignStatus.Active, CampaignStatus.AwaitingApproval]

/** Shared by business and provider; actions depend on role and status. */
export function CampaignWorkspace() {
  const { id } = useParams() as { id: string }
  const { user } = useAuth()
  const isBusiness = user?.role === UserRole.Business
  const isProvider = user?.role === UserRole.Provider

  const campaign = useQuery({ queryKey: ['campaign', id], queryFn: () => campaignsApi.get(id) })
  const milestones = useQuery({ queryKey: ['milestones', id], queryFn: () => campaignsApi.milestones(id) })
  const requirement = useQuery({
    queryKey: ['requirement', campaign.data?.requirementId],
    queryFn: () => requirementsApi.get(campaign.data!.requirementId),
    enabled: isBusiness && Boolean(campaign.data),
  })

  const [changesFor, setChangesFor] = useState<MilestoneDto | null>(null)
  const [changeNotes, setChangeNotes] = useState('')
  const [submitFor, setSubmitFor] = useState<MilestoneDto | null>(null)
  const [deliverables, setDeliverables] = useState<AttachFileRequest[]>([])
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeFiles, setDisputeFiles] = useState<AttachFileRequest[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewed, setReviewed] = useState(false)

  const fund = useCampaignAction(id, () => campaignsApi.fund(id), 'Campaign funded. The provider can start work.')
  const approve = useCampaignAction(id, (mid: string) => milestonesApi.approve(mid), 'Milestone approved. Release the payout when ready.')
  const payout = useCampaignAction(id, (mid: string) => milestonesApi.payout(mid), 'Payout released.')
  const requestChanges = useCampaignAction(
    id,
    (mid: string) => milestonesApi.requestChanges(mid, changeNotes),
    'Change request sent.',
    () => {
      setChangesFor(null)
      setChangeNotes('')
    },
  )
  const submitMilestone = useCampaignAction(
    id,
    (mid: string) => milestonesApi.submit(mid, deliverables),
    'Milestone submitted for approval.',
    () => {
      setSubmitFor(null)
      setDeliverables([])
    },
  )
  const dispute = useCampaignAction(
    id,
    () => campaignsApi.dispute(id, { reason: disputeReason, evidence: disputeFiles.length ? disputeFiles : null }),
    'Dispute opened. The BrandBridge team will review it.',
    () => {
      setDisputeOpen(false)
      setDisputeReason('')
      setDisputeFiles([])
    },
  )
  const review = useCampaignAction(id, () => campaignsApi.review(id, { rating, comment: comment || null }), 'Thanks for your review.', () =>
    setReviewed(true),
  )

  if (campaign.isLoading) return <Spinner />
  if (campaign.error || !campaign.data || !user) {
    return (
      <>
        <PageHeader back="/campaigns" title="Campaign" />
        <ErrorBox error={campaign.error} />
      </>
    )
  }
  const c = campaign.data
  const ms = milestones.data ?? []
  const paid = ms.filter((m) => m.status === MilestoneStatus.Paid).reduce((s, m) => s + m.amount, 0)
  const title = requirement.data?.title ?? `Campaign ${shortId(c.id)}`

  return (
    <>
      <PageHeader
        back="/campaigns"
        title={title}
        subtitle={<StatusBadge kind="campaign" status={c.status} />}
        actions={
          <>
            {isBusiness && c.status === CampaignStatus.PendingFunding && (
              <button className="btn primary" disabled={fund.isPending} onClick={() => fund.mutate(undefined)}>
                {fund.isPending ? 'Funding…' : `Fund ${money(c.agreedPrice, c.currency)}`}
              </button>
            )}
            {disputable.includes(c.status) && (
              <button className="btn ghost danger" onClick={() => setDisputeOpen(true)}>
                Open dispute
              </button>
            )}
          </>
        }
      />

      {c.status === CampaignStatus.PendingFunding && (
        <Alert tone="warn">
          {isBusiness
            ? 'Fund the campaign to start work. Funds are released to the provider milestone by milestone after you approve.'
            : 'Waiting for the business to fund the campaign. Do not start work until it is funded.'}
        </Alert>
      )}
      {c.status === CampaignStatus.Disputed && <Alert tone="error">This campaign is under dispute. The BrandBridge team is reviewing it.</Alert>}

      <div className="stats">
        <Stat label="Agreed price" value={money(c.agreedPrice, c.currency)} />
        <Stat label="Platform fee" value={money(c.platformFeeAmount, c.currency)} />
        <Stat label="Paid out" value={money(paid, c.currency)} />
        <Stat label="Started" value={date(c.createdAt)} />
      </div>

      <div className="workspace">
        <Card title="Milestones">
          {milestones.isLoading ? (
            <Spinner />
          ) : (
            <ol className="milestones">
              {ms.map((m) => (
                <li key={m.id} className="milestone">
                  <div className="milestone-head">
                    <span className="step-no">{m.sortOrder}</span>
                    <div>
                      <strong>{m.title}</strong>
                      <div className="muted small">
                        {money(m.amount, c.currency)}
                        {m.dueDate && ` · due ${date(m.dueDate)}`}
                      </div>
                    </div>
                    <StatusBadge kind="milestone" status={m.status} />
                  </div>
                  <div className="milestone-actions">
                    {isProvider && providerCanSubmit.includes(m.status) && c.status === CampaignStatus.Active && (
                      <button className="btn primary small" onClick={() => setSubmitFor(m)}>
                        {m.status === MilestoneStatus.ChangesRequested ? 'Resubmit work' : 'Upload and submit'}
                      </button>
                    )}
                    {isBusiness && m.status === MilestoneStatus.Submitted && (
                      <>
                        <button className="btn primary small" disabled={approve.isPending} onClick={() => approve.mutate(m.id)}>
                          Approve
                        </button>
                        <button className="btn ghost small" onClick={() => setChangesFor(m)}>
                          Request changes
                        </button>
                      </>
                    )}
                    {isBusiness && m.status === MilestoneStatus.Approved && (
                      <button className="btn primary small" disabled={payout.isPending} onClick={() => payout.mutate(m.id)}>
                        Release payout
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {c.status === CampaignStatus.Completed && (
            <div className="review-box">
              <h3>Leave a review</h3>
              {reviewed ? (
                <p className="muted">Review submitted.</p>
              ) : (
                <form
                  className="stack"
                  onSubmit={(e) => {
                    e.preventDefault()
                    review.mutate(undefined)
                  }}
                >
                  <div className="stars" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} stars`} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea rows={3} aria-label="Review comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How did it go?" />
                  <button className="btn primary" disabled={review.isPending}>
                    Submit review
                  </button>
                </form>
              )}
            </div>
          )}
        </Card>

        <Card title="Messages" className="thread-card">
          <MessageThread campaignId={id} currentUserId={user.userId} />
        </Card>
      </div>

      {submitFor && (
        <Modal title={`Submit “${submitFor.title}”`} onClose={() => setSubmitFor(null)}>
          <p className="muted">Upload the deliverables for this milestone. The business will approve or request changes.</p>
          <FileUploader files={deliverables} onChange={setDeliverables} label="Upload deliverables" />
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setSubmitFor(null)}>
              Cancel
            </button>
            <button className="btn primary" disabled={submitMilestone.isPending} onClick={() => submitMilestone.mutate(submitFor.id)}>
              Submit for approval
            </button>
          </div>
        </Modal>
      )}

      {changesFor && (
        <Modal title={`Request changes to “${changesFor.title}”`} onClose={() => setChangesFor(null)}>
          <Field label="What needs to change?">
            <textarea rows={4} value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} />
          </Field>
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setChangesFor(null)}>
              Cancel
            </button>
            <button className="btn primary" disabled={!changeNotes.trim() || requestChanges.isPending} onClick={() => requestChanges.mutate(changesFor.id)}>
              Send request
            </button>
          </div>
        </Modal>
      )}

      {disputeOpen && (
        <Modal title="Open a dispute" onClose={() => setDisputeOpen(false)}>
          <Alert tone="warn">Try resolving the issue in messages first. Disputes pause the campaign until the BrandBridge team reviews them.</Alert>
          <Field label="What went wrong?">
            <textarea rows={4} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
          </Field>
          <FileUploader files={disputeFiles} onChange={setDisputeFiles} label="Attach evidence" />
          <div className="form-actions">
            <button className="btn ghost" onClick={() => setDisputeOpen(false)}>
              Cancel
            </button>
            <button className="btn danger" disabled={!disputeReason.trim() || dispute.isPending} onClick={() => dispute.mutate(undefined)}>
              Open dispute
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}

function useCampaignAction<T = void>(campaignId: string, fn: (arg: T) => Promise<unknown>, success: string, after?: () => void) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign', campaignId] })
      qc.invalidateQueries({ queryKey: ['milestones', campaignId] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success(success)
      after?.()
    },
    onError: toast.error,
  })
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
