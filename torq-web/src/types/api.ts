// Mirrors Torq.Api/Contracts (camelCase JSON).
import type {
  BusinessStatus,
  CampaignStatus,
  DisputeStatus,
  MilestoneStatus,
  PricingModel,
  ProposalStatus,
  ProviderStatus,
  ProviderType,
  RequirementStatus,
  SocialPlatform,
  UserRole,
  UserStatus,
} from './enums'

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface ApiError {
  error: string
  code: number
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  role: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

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
  status: UserStatus
  businessId: string | null
  providerProfileId: string | null
}

export interface BusinessDto {
  id: string
  legalName: string
  displayName: string
  industry: string | null
  description: string | null
  website: string | null
  headquartersCity: string | null
  headquartersRegion: string | null
  countryCode: string
  status: BusinessStatus
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
  headline: string | null
  bio: string | null
  city: string | null
  region: string | null
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
  description: string | null
  startingPrice: number | null
  pricingModel: PricingModel
  typicalDeliveryDays: number | null
  isActive: boolean
}

export interface UpsertServiceRequest {
  category: string
  title: string
  description?: string | null
  startingPrice?: number | null
  pricingModel: PricingModel
  typicalDeliveryDays?: number | null
}

export interface PortfolioItemDto {
  id: string
  title: string
  description: string | null
  clientOrIndustry: string | null
  mediaUrl: string | null
  metricsEvidence: string | null
  sortOrder: number
}

export interface CreatePortfolioRequest {
  title: string
  description?: string | null
  clientOrIndustry?: string | null
  mediaUrl?: string | null
  metricsEvidence?: string | null
}

export interface SocialAccountDto {
  id: string
  platform: SocialPlatform
  handle: string
  profileUrl: string | null
  isOwnershipVerified: boolean
  followerCount: number | null
}

export interface CreateSocialRequest {
  platform: SocialPlatform
  handle: string
  profileUrl?: string | null
  followerCount?: number | null
}

export interface FileAssetDto {
  id: string
  fileName: string
  storageKey: string
  contentType: string
  sizeBytes: number
}

export interface AttachFileRequest {
  storageKey: string
  fileName: string
  contentType: string
  sizeBytes: number
  externalUrl?: string | null
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

export interface RequirementDto {
  id: string
  businessId: string
  title: string
  category: string
  goal: string
  targetAudience: string | null
  location: string | null
  languages: string
  expectedDeliverables: string
  budgetMin: number | null
  budgetMax: number | null
  currency: string
  timelineDays: number | null
  timelineNotes: string | null
  selectionPreference: string | null
  proposalDeadlineAt: string | null
  status: RequirementStatus
  createdAt: string
  assets: FileAssetDto[]
}

export interface OpportunityDto {
  id: string
  title: string
  category: string
  goal: string
  location: string | null
  budgetMin: number | null
  budgetMax: number | null
  proposalDeadlineAt: string | null
  createdAt: string
}

export interface ProposalMilestoneDto {
  sortOrder: number
  title: string
  description?: string | null
  amount: number
  dueDate?: string | null
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

export interface ProposalDto {
  id: string
  requirementId: string
  providerProfileId: string
  providerHeadline: string | null
  status: ProposalStatus
  pricingModel: PricingModel
  priceAmount: number
  currency: string
  scopeOfWork: string
  deliverables: string
  timelineDays: number
  revisionsIncluded: number
  coverNote: string | null
  portfolioItemIds: string[]
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
  dueDate: string | null
}

export interface MessageDto {
  id: string
  senderUserId: string | null
  body: string
  createdAt: string
  attachments: FileAssetDto[]
}

export interface CreateMessageRequest {
  body: string
  attachments?: AttachFileRequest[] | null
}

export interface CreateReviewRequest {
  rating: number
  comment?: string | null
}

export interface CreateDisputeRequest {
  reason: string
  evidence?: AttachFileRequest[] | null
}

export interface DisputeDto {
  id: string
  campaignId: string
  openedByUserId: string
  reason: string
  status: DisputeStatus
  createdAt: string
}

export interface AdminDecisionRequest {
  notes?: string | null
}
