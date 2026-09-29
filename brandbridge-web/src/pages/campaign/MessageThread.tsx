import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsApi } from '../../api'
import { FileUploader } from '../../components/FileUploader'
import { EmptyState, Spinner } from '../../components/ui'
import { useToast } from '../../components/Toast'
import type { AttachFileRequest } from '../../types/api'
import { dateTime, formatBytes } from '../../lib/format'

const PAGE_SIZE = 50

/** Messages are returned oldest-first, so load the last page to show the latest conversation. */
async function loadLatest(campaignId: string) {
  const first = await campaignsApi.messages(campaignId, 1, PAGE_SIZE)
  const lastPage = Math.ceil(first.total / PAGE_SIZE)
  if (lastPage <= 1) return first.items
  return (await campaignsApi.messages(campaignId, lastPage, PAGE_SIZE)).items
}

export function MessageThread({ campaignId, currentUserId }: { campaignId: string; currentUserId: string }) {
  const toast = useToast()
  const qc = useQueryClient()
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<AttachFileRequest[]>([])
  const bottom = useRef<HTMLDivElement>(null)

  const messages = useQuery({
    queryKey: ['messages', campaignId],
    queryFn: () => loadLatest(campaignId),
    refetchInterval: 10_000,
  })

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [messages.data?.length])

  const send = useMutation({
    mutationFn: () => campaignsApi.postMessage(campaignId, { body: body.trim(), attachments: files.length ? files : null }),
    onSuccess: () => {
      setBody('')
      setFiles([])
      qc.invalidateQueries({ queryKey: ['messages', campaignId] })
    },
    onError: toast.error,
  })

  return (
    <div className="thread">
      <div className="thread-body">
        {messages.isLoading ? (
          <Spinner />
        ) : !messages.data?.length ? (
          <EmptyState>No messages yet. Say hello and confirm the kickoff details.</EmptyState>
        ) : (
          messages.data.map((m) => {
            const mine = m.senderUserId === currentUserId
            const system = m.senderUserId === null
            return (
              <div key={m.id} className={`msg ${mine ? 'mine' : ''} ${system ? 'system' : ''}`}>
                <p className="pre">{m.body}</p>
                {m.attachments.length > 0 && (
                  <ul className="attachments">
                    {m.attachments.map((a) => (
                      <li key={a.id}>
                        📎 {a.fileName} <span className="muted">({formatBytes(a.sizeBytes)})</span>
                      </li>
                    ))}
                  </ul>
                )}
                <span className="msg-time">{dateTime(m.createdAt)}</span>
              </div>
            )
          })
        )}
        <div ref={bottom} />
      </div>
      <form
        className="composer"
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          if (body.trim()) send.mutate()
        }}
      >
        <textarea
          rows={2}
          aria-label="Message"
          placeholder="Type a message… (phone numbers and emails are blocked)"
          value={body}
          maxLength={8000}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (body.trim()) send.mutate()
            }
          }}
        />
        <div className="composer-actions">
          <FileUploader files={files} onChange={setFiles} label="Attach" />
          <button className="btn primary" disabled={send.isPending || !body.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
