export const UserRole = {
  Business: 1,
  Provider: 2,
  Admin: 3,
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const UserStatus = {
  Active: 1,
  Suspended: 2,
} as const

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

export const ProviderStatus = {
  Unverified: 1,
  VerificationPending: 2,
  Verified: 3,
  Restricted: 4,
  Suspended: 5,
} as const
export type ProviderStatus = (typeof ProviderStatus)[keyof typeof ProviderStatus]

export const PricingModel = {
  Fixed: 1,
  Milestone: 2,
  MonthlyRetainer: 3,
  PerDeliverable: 4,
} as const
export type PricingModel = (typeof PricingModel)[keyof typeof PricingModel]

export const ProviderType = {
  Freelancer: 1,
  Creator: 2,
  Influencer: 3,
  Specialist: 4,
  Agency: 5,
} as const
export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType]

export interface AuthResponse {
  accessToken: string
  userId: string
  role: UserRole
  displayName: string
}

export interface MeResponse {
  userId: string
  email: string
  displayName: string
  role: UserRole
  status: number
  businessId: string | null
  providerProfileId: string | null
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface FileAssetDto {
  id: string
  fileName: string
  storageKey: string
  contentType: string
  sizeBytes: number
}

export interface RequirementDto {
  id: string
  businessId: string
  title: string
  category: string
  goal: string
  targetAudience?: string | null
  location?: string | null
  languages: string
  expectedDeliverables: string
  budgetMin?: number | null
  budgetMax?: number | null
  currency: string
  timelineDays?: number | null
  timelineNotes?: string | null
  selectionPreference?: string | null
  proposalDeadlineAt?: string | null
  status: RequirementStatus
  createdAt: string
  assets: FileAssetDto[]
}

export interface CreateRequirementRequest {
  title: string
  category: string
  goal: string
  targetAudience?: string | null
  location?: string | null
  languages: string
  expectedDeliverables: string
  budgetMin?: number | null
  budgetMax?: number | null
  timelineDays?: number | null
  timelineNotes?: string | null
  selectionPreference?: string | null
  proposalDeadlineAt?: string | null
}

export interface ProposalDto {
  id: string
  requirementId: string
  providerProfileId: string
  providerHeadline?: string | null
  status: ProposalStatus
  pricingModel: PricingModel
  priceAmount: number
  currency: string
  scopeOfWork: string
  deliverables: string
  timelineDays: number
  revisionsIncluded: number
  coverNote?: string | null
  portfolioItemIds: string[]
  createdAt: string
}

export interface UpsertProposalRequest {
  requirementId: string
  pricingModel: PricingModel
  priceAmount: number
  scopeOfWork: string
  deliverables: string
  timelineDays: number
  timelineNotes?: string | null
  expectedMetrics?: string | null
  revisionsIncluded: number
  clientRequirements?: string | null
  optionalAddOns?: string | null
  coverNote?: string | null
  submit: boolean
  milestones?: ProposalMilestoneDto[] | null
  portfolioItemIds?: string[] | null
}

export interface ProposalMilestoneDto {
  sortOrder: number
  title: string
  description?: string | null
  amount: number
  dueDate?: string | null
}

export interface OpportunityDto {
  id: string
  title: string
  category: string
  goal: string
  location?: string | null
  budgetMin?: number | null
  budgetMax?: number | null
  proposalDeadlineAt?: string | null
  createdAt: string
}

export interface CampaignDto {
  id: string
  requirementId: string
  proposalId: string
  status: CampaignStatus
  agreedPrice: number
  currency: string
  platformFeeAmount: number
  createdAt: string
}

export interface MilestoneDto {
  id: string
  sortOrder: number
  title: string
  amount: number
  status: MilestoneStatus
  dueDate?: string | null
}

export interface MessageDto {
  id: string
  senderUserId?: string | null
  body: string
  createdAt: string
  attachments: FileAssetDto[]
}

export interface BusinessDto {
  id: string
  legalName: string
  displayName: string
  industry?: string | null
  description?: string | null
  website?: string | null
  headquartersCity?: string | null
  headquartersRegion?: string | null
  countryCode: string
  status: number
}

export interface UpdateBusinessRequest {
  legalName: string
  displayName: string
  industry?: string | null
  description?: string | null
  website?: string | null
  headquartersCity?: string | null
  headquartersRegion?: string | null
  gstin?: string | null
  billingEmail?: string | null
}

export interface ProviderDto {
  id: string
  providerType: ProviderType
  headline?: string | null
  bio?: string | null
  city?: string | null
  region?: string | null
  countryCode: string
  languages: string
  serviceCategories: string
  status: ProviderStatus
  identityVerified: boolean
  portfolioVerified: boolean
  socialVerified: boolean
}

export interface UpdateProviderRequest {
  providerType: ProviderType
  headline?: string | null
  bio?: string | null
  city?: string | null
  region?: string | null
  languages: string
  serviceCategories: string
  minRate?: number | null
  maxRate?: number | null
  availability?: string | null
}

export interface ProviderServiceDto {
  id: string
  category: string
  title: string
  description?: string | null
  startingPrice?: number | null
  pricingModel: PricingModel
  typicalDeliveryDays?: number | null
  isActive: boolean
}

export interface PortfolioItemDto {
  id: string
  title: string
  description?: string | null
  clientOrIndustry?: string | null
  mediaUrl?: string | null
  metricsEvidence?: string | null
  sortOrder: number
}

export interface DisputeDto {
  id: string
  campaignId: string
  openedByUserId: string
  reason: string
  status: number
  createdAt: string
}

export interface UpsertServiceRequest {
  category: string
  title: string
  description?: string | null
  startingPrice?: number | null
  pricingModel: PricingModel
  typicalDeliveryDays?: number | null
}

export interface CreatePortfolioRequest {
  title: string
  description?: string | null
  clientOrIndustry?: string | null
  mediaUrl?: string | null
  metricsEvidence?: string | null
}
