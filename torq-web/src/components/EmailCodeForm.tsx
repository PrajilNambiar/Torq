import { useState, type FormEvent } from 'react'
import { authApi } from '../api'
import { Alert, ErrorBox, TextBox } from './ui'

export function EmailCodeForm({
  email,
  onVerified,
  submitLabel = 'Verify email',
}: {
  email: string
  onVerified: () => Promise<void>
  submitLabel?: string
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await authApi.verifyOtp({ email, code: code.trim() })
      await onVerified()
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await authApi.sendOtp({ email })
      setNotice('A new code was sent. It expires in 10 minutes.')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <ErrorBox error={error} />
      {notice && <Alert tone="success">{notice}</Alert>}
      <TextBox
        label="Verification code"
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        minLength={6}
        maxLength={6}
        placeholder="6-digit code"
        hint={`Sent to ${email}. The code expires in 10 minutes.`}
        value={code}
        onChange={setCode}
      />
      <button className="btn primary block auth-submit" disabled={busy}>
        {busy ? 'Checking code…' : submitLabel}
      </button>
      <button type="button" className="btn ghost block" disabled={busy} onClick={resend}>
        Resend code
      </button>
    </form>
  )
}
