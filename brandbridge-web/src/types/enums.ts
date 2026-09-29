// Mirrors BrandBridge.Api/Domain/Enums. The API serializes enums as numbers.

export const UserRole = { Business: 1, Provider: 2, Admin: 3 } as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const UserStatus = { Active: 1, PendingVerification: 2, Restricted: 3, Suspended: 4 } as const
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const BusinessStatus = { Draft: 1, Active: 2, Restricted: 3, Suspended: 4 } as const
export type BusinessStatus = (typeof BusinessStatus)[keyof typeof BusinessStatus]

export const ProviderStatus = {
  Unverified: 1,
  VerificationPending: 2,
  Verified: 3,
  Restricted: 4,
  Suspended: 5,
} as const
export type ProviderStatus = (typeof ProviderStatus)[keyof typeof ProviderStatus]

export const ProviderType = { Freelancer: 1, Creator: 2, Influencer: 3, Specialist: 4, Agency: 5 } as const
export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType]

export const RequirementStatus = {
  Draft: 1,
  UnderReview: 2,
  Open: 3,
  ProposalReview: 4,
  ProviderSelected: 5,
  Closed: 6,
  Cancelled: 7,
} as const
export type RequirementStatus = (typeof RequirementStatus)[keyof typeof RequirementStatus]

export const ProposalStatus = {
  Draft: 1,
  Submitted: 2,
  Shortlisted: 3,
  Accepted: 4,
  Rejected: 5,
  Withdrawn: 6,
  Expired: 7,
} as const
export type ProposalStatus = (typeof ProposalStatus)[keyof typeof ProposalStatus]

export const CampaignStatus = {
  PendingFunding: 1,
  Active: 2,
  AwaitingApproval: 3,
  Completed: 4,
  Cancelled: 5,
  Disputed: 6,
} as const
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus]

export const MilestoneStatus = {
  Planned: 1,
  Funded: 2,
  InProgress: 3,
  Submitted: 4,
  ChangesRequested: 5,
  Approved: 6,
  Paid: 7,
} as const
export type MilestoneStatus = (typeof MilestoneStatus)[keyof typeof MilestoneStatus]

export const PricingModel = { Fixed: 1, Milestone: 2, MonthlyRetainer: 3, PerDeliverable: 4 } as const
export type PricingModel = (typeof PricingModel)[keyof typeof PricingModel]

export const SocialPlatform = {
  Instagram: 1,
  YouTube: 2,
  TikTok: 3,
  LinkedIn: 4,
  Facebook: 5,
  Threads: 6,
  Other: 7,
} as const
export type SocialPlatform = (typeof SocialPlatform)[keyof typeof SocialPlatform]

export const DisputeStatus = { Open: 1, UnderReview: 2, Resolved: 3, Rejected: 4, Escalated: 5 } as const
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus]

function labelsOf<T extends Record<string, number>>(values: T): Record<number, string> {
  const out: Record<number, string> = {}
  for (const [key, value] of Object.entries(values)) {
    out[value] = key.replace(/([a-z])([A-Z])/g, '$1 $2')
  }
  return out
}

export const labels = {
  userRole: labelsOf(UserRole),
  providerStatus: labelsOf(ProviderStatus),
  providerType: labelsOf(ProviderType),
  requirementStatus: labelsOf(RequirementStatus),
  proposalStatus: labelsOf(ProposalStatus),
  campaignStatus: labelsOf(CampaignStatus),
  milestoneStatus: labelsOf(MilestoneStatus),
  pricingModel: labelsOf(PricingModel),
  socialPlatform: labelsOf(SocialPlatform),
  disputeStatus: labelsOf(DisputeStatus),
}

export function optionsOf<T extends Record<string, number>>(values: T) {
  return Object.entries(values).map(([key, value]) => ({
    value,
    label: key.replace(/([a-z])([A-Z])/g, '$1 $2'),
  }))
}

// Requirement.Category must exactly match one of the provider's ServiceCategories.
export const SERVICE_CATEGORIES = [
  'Influencer marketing',
  'UGC / content creation',
  'Social media management',
  'Paid advertising',
] as const
