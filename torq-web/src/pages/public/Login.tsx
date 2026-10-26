import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { homeFor } from '../../auth/homeFor'
import { AuthShell } from '../../components/AuthShell'
import { ErrorBox, TextBox } from '../../components/ui'
import { IconLock, IconMail } from '../../components/ui/icons'

export function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={homeFor(user.role)} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const me = await login({ email, password })
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? homeFor(me.role), { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Welcome to TORQ"
      subtitle="Sign in to post briefs, send proposals, and run campaigns in one place."
    >
      <form className="auth-form" onSubmit={submit}>
        <ErrorBox error={error} />
        <TextBox
          label="Email address"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          leadingIcon={<IconMail />}
          value={email}
          onChange={setEmail}
        />
        <TextBox
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          leadingIcon={<IconLock />}
          value={password}
          onChange={setPassword}
        />
        <button className="btn primary block auth-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </AuthShell>
  )
}
