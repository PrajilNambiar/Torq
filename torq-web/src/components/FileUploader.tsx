import { useRef, useState } from 'react'
import { filesApi } from '../api'
import type { AttachFileRequest } from '../types/api'
import { formatBytes } from '../lib/format'
import { useToast } from './Toast'

const ACCEPT = '.png,.jpg,.jpeg,.webp,.pdf,.mp4,.mov,.doc,.docx'
const MAX_BYTES = 20_000_000

/** Uploads to POST /files and returns references that can be attached to other resources. */
export function FileUploader({
  files,
  onChange,
  label = 'Attach files',
}: {
  files: AttachFileRequest[]
  onChange: (files: AttachFileRequest[]) => void
  label?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  async function handle(list: FileList | null) {
    if (!list?.length) return
    setBusy(true)
    const uploaded: AttachFileRequest[] = []
    try {
      for (const file of Array.from(list)) {
        if (file.size > MAX_BYTES) {
          toast.error(new Error(`${file.name} is larger than 20 MB.`))
          continue
        }
        uploaded.push(await filesApi.upload(file))
      }
      onChange([...files, ...uploaded])
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="uploader">
      <input ref={input} type="file" multiple accept={ACCEPT} hidden onChange={(e) => handle(e.target.files)} />
      <button type="button" className="btn ghost" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? 'Uploading…' : `📎 ${label}`}
      </button>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f) => (
            <li key={f.storageKey}>
              <span>{f.fileName}</span>
              <span className="muted">{formatBytes(f.sizeBytes)}</span>
              <button type="button" className="link" onClick={() => onChange(files.filter((x) => x.storageKey !== f.storageKey))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
