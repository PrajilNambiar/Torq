import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { CampaignDto, MessageDto, MilestoneDto } from '../../api/types'
import {
  CampaignStatus,
  MilestoneStatus,
  UserRole,
} from '../../api/types'
import { useAuth } from '../../auth/AuthContext'
import { StatusChip } from '../../components/StatusChip'
import { campaignStatusLabel, milestoneStatusLabel, money } from '../../lib/labels'

export function CampaignDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const isBusiness = user?.role === UserRole.Business
  const isProvider = user?.role === UserRole.Provider
  const back = isProvider ? '/provider/campaigns' : '/business/campaigns'

  const [campaign, setCampaign] = useState<CampaignDto | null>(null)
  const [milestones, setMilestones] = useState<MilestoneDto[]>([])
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [c, m, msg] = await Promise.all([
      api.getCampaign(id),
      api.listMilestones(id),
      api.listMessages(id),
    ])
    setCampaign(c)
    setMilestones(m)
    setMessages(msg.items)
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    await run(async () => {
      await api.postMessage(id, body.trim())
      setBody('')
    })
  }

  if (!campaign && !error) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="page">
        <div className="alert">{error}</div>
      </div>
    )
  }

  return (
    <div className="page stack-lg">
      <div className="section-head">
        <div>
          <div className="row">
            <h1>Campaign</h1>
            <StatusChip label={campaignStatusLabel[campaign.status]} tone="teal" />
          </div>
          <p className="muted">
            {money(campaign.agreedPrice, campaign.currency)} · platform fee{' '}
            {money(campaign.platformFeeAmount, campaign.currency)}
          </p>
        </div>
        <div className="row">
          {isBusiness && campaign.status === CampaignStatus.PendingFunding && (
            <button className="btn btn-accent" disabled={busy} onClick={() => run(() => api.fundCampaign(id))}>
              Fund campaign
            </button>
          )}
          <Link className="btn btn-ghost" to={back}>
            Back
          </Link>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <section className="stack">
        <h2 style={{ margin: 0 }}>Milestones</h2>
        <div className="list">
          {milestones.map((m) => (
            <div key={m.id} className="list-item">
              <div className="row">
                <h3>
                  {m.sortOrder}. {m.title}
                </h3>
                <StatusChip label={milestoneStatusLabel[m.status]} />
              </div>
              <div className="row muted">
                <span>{money(m.amount, campaign.currency)}</span>
                {m.dueDate && <span>Due {m.dueDate}</span>}
              </div>
              <div className="row">
                {isProvider &&
                  (m.status === MilestoneStatus.Funded ||
                    m.status === MilestoneStatus.InProgress ||
                    m.status === MilestoneStatus.ChangesRequested) && (
                    <button
                      className="btn btn-primary"
                      disabled={busy}
                      onClick={() => run(() => api.submitMilestone(m.id))}
                    >
                      Submit for approval
                    </button>
                  )}
                {isBusiness && m.status === MilestoneStatus.Submitted && (
                  <>
                    <button
                      className="btn btn-primary"
                      disabled={busy}
                      onClick={() => run(() => api.approveMilestone(m.id))}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={() =>
                        run(() => api.requestChanges(m.id, 'Please revise deliverables'))
                      }
                    >
                      Request changes
                    </button>
                  </>
                )}
                {isBusiness && m.status === MilestoneStatus.Approved && (
                  <button
                    className="btn btn-accent"
                    disabled={busy}
                    onClick={() => run(() => api.payoutMilestone(m.id))}
                  >
                    Payout
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <h2 style={{ margin: 0 }}>Messages</h2>
        <div className="messages">
          {messages.length === 0 && <p className="muted">No messages yet.</p>}
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <time>{new Date(msg.createdAt).toLocaleString()}</time>
              {msg.body}
            </div>
          ))}
        </div>
        <form className="row" onSubmit={sendMessage}>
          <label className="field" style={{ flex: 1 }}>
            <span className="muted">Message</span>
            <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Keep it on-platform" />
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy || !body.trim()}>
            Send
          </button>
        </form>
      </section>
    </div>
  )
}
