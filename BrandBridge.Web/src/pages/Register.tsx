import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../api/client'
import { UserRole } from '../api/types'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.Business)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const home = await register({ email, password, displayName, role })
      navigate(home)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <h1>Join BrandBridge</h1>
      <p className="muted">Create a business or provider account to start the marketplace loop.</p>
      <form className="stack" style={{ marginTop: '1.25rem' }} onSubmit={onSubmit}>
        {error && <div className="alert">{error}</div>}
        <div className="role-picker">
          <button
            type="button"
            className={role === UserRole.Business ? 'active' : undefined}
            onClick={() => setRole(UserRole.Business)}
          >
            <strong>Business</strong>
            <span className="muted">Post briefs & hire</span>
          </button>
          <button
            type="button"
            className={role === UserRole.Provider ? 'active' : undefined}
            onClick={() => setRole(UserRole.Provider)}
          >
            <strong>Provider</strong>
            <span className="muted">Pitch & deliver</span>
          </button>
        </div>
        <label className="field">
          Display name
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="field">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
