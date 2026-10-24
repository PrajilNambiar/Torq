import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { homeFor } from '../../auth/homeFor'
import { BrandMark } from '../../components/BrandMark'
import { ErrorBox, TextBox } from '../../components/ui'
import { UserRole } from '../../types/enums'

export function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState<UserRole>(params.get('role') === 'provider' ? UserRole.Provider : UserRole.Business)
  const [displayName, setDisplayName] = useState('')
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
      const me = await register({ email, password, displayName, role })
      navigate(me.role === UserRole.Provider ? '/provider/profile' : '/business/profile', { replace: true })
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
        <h1>Create your account</h1>

        <div className="role-toggle" role="radiogroup" aria-label="Account type">
          <button
            type="button"
            role="radio"
            aria-checked={role === UserRole.Business}
            className={role === UserRole.Business ? 'selected' : ''}
            onClick={() => setRole(UserRole.Business)}
          >
            <strong>Business</strong>
            <span className="muted">I need marketing help</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={role === UserRole.Provider}
            className={role === UserRole.Provider ? 'selected' : ''}
            onClick={() => setRole(UserRole.Provider)}
          >
            <strong>Provider</strong>
            <span className="muted">Creator, marketer or agency</span>
          </button>
        </div>

        <ErrorBox error={error} />
        <TextBox
          label={role === UserRole.Business ? 'Business name' : 'Your name or agency name'}
          required
          maxLength={120}
          value={displayName}
          onChange={setDisplayName}
        />
        <TextBox label="Email" type="email" required autoComplete="email" value={email} onChange={setEmail} />
        <TextBox
          label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          hint="At least 8 characters, with upper case, lower case and a digit."
          value={password}
          onChange={setPassword}
        />
        <button className="btn primary block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="muted center">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
