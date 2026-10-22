import { Link } from 'react-router-dom'
import { Alert } from '../../components/ui'
import { ProviderStatus } from '../../types/enums'
import type { ProviderDto } from '../../types/api'

export function VerificationBanner({ provider }: { provider: ProviderDto | undefined }) {
  if (!provider) return null
  switch (provider.status) {
    case ProviderStatus.Verified:
      return null
    case ProviderStatus.Unverified:
      return (
        <Alert tone="warn">
          Complete your <Link to="/provider/profile">profile</Link>, then add services, portfolio and social accounts. Our
          team verifies every provider before they can see opportunities.
        </Alert>
      )
    case ProviderStatus.VerificationPending:
      return (
        <Alert tone="info">
          Your profile is waiting for verification. You'll be able to browse opportunities and send proposals once it's
          approved.
        </Alert>
      )
    default:
      return <Alert tone="error">Your provider account is restricted. Please contact Torq support.</Alert>
  }
}
