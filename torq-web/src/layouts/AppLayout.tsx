import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BrandMark } from '../components/BrandMark'
import {
  IconBriefcase,
  IconClipboard,
  IconFilePlus,
  IconFlag,
  IconHome,
  IconImage,
  IconLayers,
  IconMegaphone,
  IconQueue,
  IconSearch,
  IconShare,
  IconUser,
  IconUsers,
} from '../components/icons'
import { UserRole, labels } from '../types/enums'

type NavItem = { to: string; label: string; end?: boolean; icon: ReactNode }

const nav: Record<UserRole, NavItem[]> = {
  [UserRole.Business]: [
    { to: '/business', label: 'Dashboard', end: true, icon: <IconHome /> },
    { to: '/business/requirements', label: 'Requirements', icon: <IconClipboard /> },
    { to: '/business/requirements/new', label: 'Post a requirement', icon: <IconFilePlus /> },
    { to: '/campaigns', label: 'Campaigns', icon: <IconMegaphone /> },
    { to: '/business/profile', label: 'Business profile', icon: <IconUser /> },
  ],
  [UserRole.Provider]: [
    { to: '/provider', label: 'Dashboard', end: true, icon: <IconHome /> },
    { to: '/provider/opportunities', label: 'Opportunities', icon: <IconSearch /> },
    { to: '/campaigns', label: 'Campaigns', icon: <IconMegaphone /> },
    { to: '/provider/profile', label: 'Profile', icon: <IconUser /> },
    { to: '/provider/services', label: 'Services', icon: <IconLayers /> },
    { to: '/provider/portfolio', label: 'Portfolio', icon: <IconImage /> },
    { to: '/provider/social', label: 'Social accounts', icon: <IconShare /> },
  ],
  [UserRole.Admin]: [
    { to: '/admin', label: 'Overview', end: true, icon: <IconHome /> },
    { to: '/admin/requirements', label: 'Requirement queue', icon: <IconQueue /> },
    { to: '/admin/providers', label: 'Provider verification', icon: <IconUsers /> },
    { to: '/admin/disputes', label: 'Disputes', icon: <IconFlag /> },
    { to: '/admin/campaigns', label: 'Campaigns', icon: <IconBriefcase /> },
  ],
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  if (!user) return null

  return (
    <div className="shell">
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
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
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
