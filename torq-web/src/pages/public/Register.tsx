import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { EmailCodeForm } from '../../components/EmailCodeForm'
import { AuthShell } from '../../components/AuthShell'
import { ErrorBox, TextBox } from '../../components/ui'
import { IconLock, IconMail, IconUser } from '../../components/ui/icons'
import { UserRole } from '../../types/enums'

export function Register() {
  const { user, register, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role, setRole] = useState<UserRole>(params.get('role') === 'provider' ? UserRole.Provider : UserRole.Business)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={homeForRole(user.role)} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const created = await register({ email: email.trim(), password, displayName, role, phone: phone.trim() || null })
      setPendingEmail(created.email)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  function homeForRole(nextRole: UserRole) {
    return nextRole === UserRole.Provider ? '/provider/profile' : '/business/profile'
  }

  if (pendingEmail) {
    return (
      <AuthShell
        mode="register"
        title="Verify your email"
        subtitle={`Enter the code we sent to ${pendingEmail}. Your account stays locked until this email is verified.`}
      >
        <EmailCodeForm
          email={pendingEmail}
          submitLabel="Verify and continue"
          onVerified={async () => {
            const me = await login({ email: pendingEmail, password })
            navigate(homeForRole(me.role), { replace: true })
          }}
        />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      mode="register"
      title="Create your TORQ account"
      subtitle="Start by choosing how you’ll use Torq — then we’ll set up your workspace."
    >
      <form className="auth-form" onSubmit={submit}>
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
          placeholder={role === UserRole.Business ? 'Acme Foods' : 'Your name or agency'}
          leadingIcon={<IconUser />}
          value={displayName}
          onChange={setDisplayName}
        />
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
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="Optional, 10 to 15 digits"
          value={phone}
          onChange={setPhone}
        />
        <TextBox
          label="Password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Create a password"
          hint="At least 8 characters, with upper case, lower case and a digit."
          leadingIcon={<IconLock />}
          value={password}
          onChange={setPassword}
        />
        <button className="btn primary block auth-submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
