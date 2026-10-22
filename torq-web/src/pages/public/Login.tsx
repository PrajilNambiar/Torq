import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { homeFor } from '../../auth/homeFor'
import { ErrorBox, Field } from '../../components/ui'

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
    <div className="auth-page">
      <Link to="/" className="auth-back">
        ← Back to home
      </Link>
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="brand" aria-label="TORQ Home">
          <span className="brand-mark">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" />
            </svg>
          </span>
          <div className="brand-text-block">
            <span className="brand-title">TORQ</span>
            <span className="brand-badge">BrandBridge</span>
          </div>
        </Link>
        <h1>Welcome back</h1>
        <ErrorBox error={error} />
        <Field label="Email">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button className="btn primary block" disabled={busy}>
          {busy ? 'Signing in…' : 'Log in'}
        </button>
        <p className="muted center">
          New to Torq? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  )
}
