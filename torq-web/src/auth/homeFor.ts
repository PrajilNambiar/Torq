import { UserRole } from '../types/enums'

export function homeFor(role: UserRole) {
  switch (role) {
    case UserRole.Business:
      return '/business'
    case UserRole.Provider:
      return '/provider'
    case UserRole.Admin:
      return '/admin'
  }
}
