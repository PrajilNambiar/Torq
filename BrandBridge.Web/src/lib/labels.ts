import {
  CampaignStatus,
  MilestoneStatus,
  ProposalStatus,
  ProviderStatus,
  RequirementStatus,
  UserRole,
} from '../api/types'

export function roleHome(role: UserRole): string {
  if (role === UserRole.Business) return '/business'
  if (role === UserRole.Provider) return '/provider'
  if (role === UserRole.Admin) return '/admin'
  return '/'
}

export function roleLabel(role: UserRole): string {
  return (
    {
      [UserRole.Business]: 'Business',
      [UserRole.Provider]: 'Provider',
      [UserRole.Admin]: 'Admin',
    } as const
  )[role]
}

export const requirementStatusLabel: Record<RequirementStatus, string> = {
  [RequirementStatus.Draft]: 'Draft',
  [RequirementStatus.UnderReview]: 'Under review',
  [RequirementStatus.Open]: 'Open',
  [RequirementStatus.ProposalReview]: 'Proposal review',
  [RequirementStatus.ProviderSelected]: 'Provider selected',
  [RequirementStatus.Closed]: 'Closed',
  [RequirementStatus.Cancelled]: 'Cancelled',
}

export const proposalStatusLabel: Record<ProposalStatus, string> = {
  [ProposalStatus.Draft]: 'Draft',
  [ProposalStatus.Submitted]: 'Submitted',
  [ProposalStatus.Shortlisted]: 'Shortlisted',
  [ProposalStatus.Accepted]: 'Accepted',
  [ProposalStatus.Rejected]: 'Rejected',
  [ProposalStatus.Withdrawn]: 'Withdrawn',
  [ProposalStatus.Expired]: 'Expired',
}

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  [CampaignStatus.PendingFunding]: 'Pending funding',
  [CampaignStatus.Active]: 'Active',
  [CampaignStatus.AwaitingApproval]: 'Awaiting approval',
  [CampaignStatus.Completed]: 'Completed',
  [CampaignStatus.Cancelled]: 'Cancelled',
  [CampaignStatus.Disputed]: 'Disputed',
}

export const milestoneStatusLabel: Record<MilestoneStatus, string> = {
  [MilestoneStatus.Planned]: 'Planned',
  [MilestoneStatus.Funded]: 'Funded',
  [MilestoneStatus.InProgress]: 'In progress',
  [MilestoneStatus.Submitted]: 'Submitted',
  [MilestoneStatus.ChangesRequested]: 'Changes requested',
  [MilestoneStatus.Approved]: 'Approved',
  [MilestoneStatus.Paid]: 'Paid',
}

export const providerStatusLabel: Record<ProviderStatus, string> = {
  [ProviderStatus.Unverified]: 'Unverified',
  [ProviderStatus.VerificationPending]: 'Verification pending',
  [ProviderStatus.Verified]: 'Verified',
  [ProviderStatus.Restricted]: 'Restricted',
  [ProviderStatus.Suspended]: 'Suspended',
}

export function money(amount: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}
