import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { AuthPromoPanel } from './AuthPromoPanel'

type AuthMode = 'login' | 'register'

export function AuthShell({
  mode,
  title,
  subtitle,
  children,
}: {
  mode: AuthMode
  title: string
  subtitle: string
  children: ReactNode
}) {
  const location = useLocation()
  const registerTo = location.search ? `/register${location.search}` : '/register'

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back">
        ← Back to home
      </Link>
      <div className="auth-shell">
        <section className="auth-form-pane">
          <div className="auth-form-inner">
            <Link to="/" className="auth-brand" aria-label="TORQ Home">
              <span className="brand-mark">
                <BrandMark size={18} />
              </span>
              <div className="brand-text-block">
                <span className="brand-title">TORQ</span>
                <span className="brand-badge">BrandBridge</span>
              </div>
            </Link>

            <div className="auth-mode-toggle" role="tablist" aria-label="Account mode">
              <Link
                to="/login"
                role="tab"
                aria-selected={mode === 'login'}
                className={mode === 'login' ? 'active' : ''}
              >
                Sign In
              </Link>
              <Link
                to={registerTo}
                role="tab"
                aria-selected={mode === 'register'}
                className={mode === 'register' ? 'active' : ''}
              >
                Sign Up
              </Link>
            </div>

            <header className="auth-heading">
              <h1>{title}</h1>
              <p className="muted">{subtitle}</p>
            </header>

            {children}

            <footer className="auth-footer">
              <span>© {new Date().getFullYear()} Torq</span>
              <span className="auth-footer-links">
                <a href="#terms">Terms</a>
                <a href="#privacy">Privacy</a>
              </span>
            </footer>
          </div>
        </section>

        <AuthPromoPanel />
      </div>
    </div>
  )
}
