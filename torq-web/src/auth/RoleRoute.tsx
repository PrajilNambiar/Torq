import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { homeFor } from './homeFor'
import type { UserRole } from '../types/enums'
import { Spinner } from '../components/ui'

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner full />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return <Outlet />
}
