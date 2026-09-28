import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { UserRole } from '../api/types'
import { roleLabel } from '../lib/labels'

export function AppShell() {
  const { user, logout } = useAuth()

  const links =
    user?.role === UserRole.Business
      ? [
          { to: '/business', label: 'Requirements', end: true },
          { to: '/business/requirements/new', label: 'New brief' },
          { to: '/business/campaigns', label: 'Campaigns' },
          { to: '/business/profile', label: 'Profile' },
        ]
      : user?.role === UserRole.Provider
        ? [
            { to: '/provider', label: 'Opportunities', end: true },
            { to: '/provider/campaigns', label: 'Campaigns' },
            { to: '/provider/profile', label: 'Profile' },
          ]
        : user?.role === UserRole.Admin
          ? [
              { to: '/admin', label: 'Queues', end: true },
              { to: '/admin/campaigns', label: 'Campaigns' },
            ]
          : []

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">B</span>
          BrandBridge
        </NavLink>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <StatusChipSoft label={roleLabel(user.role)} />
              <span className="muted">{user.displayName}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn btn-primary">
                Get started
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}

function StatusChipSoft({ label }: { label: string }) {
  return <span className="chip chip-teal">{label}</span>
}
