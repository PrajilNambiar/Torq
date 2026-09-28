import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { roleHome } from '../lib/labels'

export function Landing() {
  const { user } = useAuth()

  return (
    <div className="page">
      <section className="hero">
        <div className="brand" style={{ fontSize: '1.6rem' }}>
          <span className="brand-mark">B</span>
          BrandBridge
        </div>
        <h1>Hire marketing talent with a clear path from brief to payout.</h1>
        <p className="lede">
          Post requirements, compare proposals, fund campaigns, and approve milestones —
          all in one marketplace for businesses and verified providers.
        </p>
        <div className="hero-actions">
          {user ? (
            <Link className="btn btn-primary" to={roleHome(user.role)}>
              Open workspace
            </Link>
          ) : (
            <>
              <Link className="btn btn-primary" to="/register">
                Get started
              </Link>
              <Link className="btn btn-ghost" to="/login">
                Log in
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
