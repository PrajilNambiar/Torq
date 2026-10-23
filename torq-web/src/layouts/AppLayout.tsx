import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BrandMark } from '../components/BrandMark'
import { UserRole, labels } from '../types/enums'

const nav: Record<UserRole, { to: string; label: string; end?: boolean }[]> = {
  [UserRole.Business]: [
    { to: '/business', label: 'Dashboard', end: true },
    { to: '/business/requirements', label: 'Requirements' },
    { to: '/business/requirements/new', label: 'Post a requirement' },
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/business/profile', label: 'Business profile' },
  ],
  [UserRole.Provider]: [
    { to: '/provider', label: 'Dashboard', end: true },
    { to: '/provider/opportunities', label: 'Opportunities' },
    { to: '/campaigns', label: 'Campaigns' },
    { to: '/provider/profile', label: 'Profile' },
    { to: '/provider/services', label: 'Services' },
    { to: '/provider/portfolio', label: 'Portfolio' },
    { to: '/provider/social', label: 'Social accounts' },
  ],
  [UserRole.Admin]: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/requirements', label: 'Requirement queue' },
    { to: '/admin/providers', label: 'Provider verification' },
    { to: '/admin/disputes', label: 'Disputes' },
    { to: '/admin/campaigns', label: 'Campaigns' },
  ],
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  if (!user) return null

  return (
    <div className="shell">
      {/* Top navigation bar for mobile/responsive screens */}
      <header className="app-topbar">
        <div className="app-topbar-left">
          <button
            type="button"
            className="app-topbar-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div className="brand">
            <span className="brand-mark">
              <BrandMark size={16} />
            </span>
            <div className="brand-text-block">
              <span className="brand-title">TORQ</span>
            </div>
          </div>
        </div>

        <div className="app-topbar-right">
          <span className="topbar-badge">{labels.userRole[user.role]}</span>
          <div className="topbar-user">
            <span className="topbar-avatar">{user.displayName[0]?.toUpperCase() ?? 'U'}</span>
            <span className="topbar-name">{user.displayName}</span>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">
            <BrandMark size={18} />
          </span>
          <div className="brand-text-block">
            <span className="brand-title">TORQ</span>
            <span className="brand-badge">BrandBridge</span>
          </div>
        </div>
        <nav>
          {nav[user.role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="who">
            <strong>{user.displayName}</strong>
            <span className="muted">{labels.userRole[user.role]}</span>
          </div>
          <button
            className="btn ghost small"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      {mobileMenuOpen && <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
