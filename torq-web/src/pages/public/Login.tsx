import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { homeFor } from '../../auth/homeFor'
import { BrandMark } from '../../components/BrandMark'
import { ErrorBox, TextBox } from '../../components/ui'

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
            <BrandMark size={18} />
          </span>
          <div className="brand-text-block">
            <span className="brand-title">TORQ</span>
            <span className="brand-badge">BrandBridge</span>
          </div>
        </Link>
        <h1>Welcome back</h1>
        <ErrorBox error={error} />
        <TextBox label="Email" type="email" required autoComplete="email" value={email} onChange={setEmail} />
        <TextBox
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
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
