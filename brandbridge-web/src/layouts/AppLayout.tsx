import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
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
  if (!user) return null

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">BB</span>
          <span>BrandBridge</span>
        </div>
        <nav>
          {nav[user.role].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'active' : '')}>
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
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
