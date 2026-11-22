import { api, idempotent } from './client'
import type {
  AdminDecisionRequest,
  AttachFileRequest,
  AuthResponse,
  BusinessDto,
  CampaignDto,
  CreateDisputeRequest,
  CreateMessageRequest,
  CreatePortfolioRequest,
  CreateRequirementRequest,
  CreateReviewRequest,
  CreateSocialRequest,
  DisputeDto,
  AuditEventDto,
  PlatformSettingsDto,
  PaymentExceptionDto,
  FileAssetDto,
  LoginRequest,
  MeResponse,
  MessageDto,
  MilestoneDto,
  OpportunityDto,
  PagedResult,
  PortfolioItemDto,
  ProposalDto,
  ProviderDto,
  ProviderCardDto,
  EarningDto,
  ProviderServiceDto,
  RegisterRequest,
  RegisterResponse,
  RequirementDto,
  RequirementQuestionDto,
  LedgerEntryDto,
  SendOtpRequest,
  SocialAccountDto,
  UpdateBusinessRequest,
  UpdateProviderRequest,
  UpsertProposalRequest,
  UpsertServiceRequest,
  VerifyOtpRequest,
} from '../types/api'

const data = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data)
const paging = (page = 1, pageSize = 20) => ({ params: { page, pageSize } })

export const authApi = {
  register: (body: RegisterRequest) => data(api.post<RegisterResponse>('/auth/register', body)),
  login: (body: LoginRequest) => data(api.post<AuthResponse>('/auth/login', body)),
  me: () => data(api.get<MeResponse>('/auth/me')),
  sendOtp: (body: SendOtpRequest) => api.post('/auth/otp/send', body),
  verifyOtp: (body: VerifyOtpRequest) => api.post('/auth/otp/verify', body),
}

export const businessApi = {
  get: () => data(api.get<BusinessDto>('/business/me')),
  update: (body: UpdateBusinessRequest) => data(api.put<BusinessDto>('/business/me', body)),
}

export const providersApi = {
  get: () => data(api.get<ProviderDto>('/providers/me')),
  update: (body: UpdateProviderRequest) => data(api.put<ProviderDto>('/providers/me', body)),
  services: () => data(api.get<ProviderServiceDto[]>('/providers/me/services')),
  addService: (body: UpsertServiceRequest) => data(api.post<ProviderServiceDto>('/providers/me/services', body)),
  portfolio: () => data(api.get<PortfolioItemDto[]>('/providers/me/portfolio')),
  addPortfolio: (body: CreatePortfolioRequest) => data(api.post<PortfolioItemDto>('/providers/me/portfolio', body)),
  social: () => data(api.get<SocialAccountDto[]>('/providers/me/social')),
  addSocial: (body: CreateSocialRequest) => data(api.post<SocialAccountDto>('/providers/me/social', body)),
  reputation: () => data(api.get<ProviderCardDto>('/providers/me/reputation')),
  earnings: () => data(api.get<EarningDto[]>('/providers/me/earnings')),
  payoutAccount: (label: string) => api.put('/providers/me/payout-account', { label }),
  card: (id: string) => data(api.get<ProviderCardDto>(`/providers/${id}/card`)),
}

export const requirementsApi = {
  list: (page?: number, pageSize?: number) =>
    data(api.get<PagedResult<RequirementDto>>('/requirements', paging(page, pageSize))),
  get: (id: string) => data(api.get<RequirementDto>(`/requirements/${id}`)),
  questions: (id: string) => data(api.get<RequirementQuestionDto[]>(`/requirements/${id}/questions`)),
  ask: (id: string, body: string) => data(api.post<RequirementQuestionDto>(`/requirements/${id}/questions`, { body })),
  answer: (id: string, questionId: string, answer: string) =>
    data(api.post<RequirementQuestionDto>(`/requirements/${id}/questions/${questionId}/answer`, { answer })),
  create: (body: CreateRequirementRequest) => data(api.post<RequirementDto>('/requirements', body)),
  update: (id: string, body: CreateRequirementRequest) => data(api.put<RequirementDto>(`/requirements/${id}`, body)),
  submit: (id: string) => api.post(`/requirements/${id}/submit`),
  proposals: (id: string) => data(api.get<ProposalDto[]>(`/requirements/${id}/proposals`)),
  shortlist: (id: string, proposalId: string) => api.post(`/requirements/${id}/proposals/${proposalId}/shortlist`),
  select: (id: string, proposalId: string) =>
    data(api.post<CampaignDto>(`/requirements/${id}/select/${proposalId}`, null, idempotent())),
  attach: (id: string, file: AttachFileRequest) => data(api.post<FileAssetDto>(`/requirements/${id}/assets`, file)),
}

export const opportunitiesApi = {
  list: (page?: number, pageSize?: number, filter?: { location?: string; language?: string; budgetMin?: number; budgetMax?: number; industry?: string }) =>
    data(api.get<PagedResult<OpportunityDto>>('/opportunities', { params: { page: page ?? 1, pageSize: pageSize ?? 20, ...filter } })),
}

export const proposalsApi = {
  upsert: (body: UpsertProposalRequest) => data(api.post<ProposalDto>('/proposals', body)),
  withdraw: (id: string) => api.post(`/proposals/${id}/withdraw`),
}

export const campaignsApi = {
  list: (page?: number, pageSize?: number) =>
    data(api.get<PagedResult<CampaignDto>>('/campaigns', paging(page, pageSize))),
  get: (id: string) => data(api.get<CampaignDto>(`/campaigns/${id}`)),
  milestones: (id: string) => data(api.get<MilestoneDto[]>(`/campaigns/${id}/milestones`)),
  fund: (id: string) => api.post(`/campaigns/${id}/fund`, null, idempotent()),
  refund: (id: string) => api.post(`/campaigns/${id}/refund`, null, idempotent()),
  cancelFunding: (id: string) => api.post(`/campaigns/${id}/cancel-funding`, null, idempotent()),
  ledger: (id: string) => data(api.get<LedgerEntryDto[]>(`/campaigns/${id}/ledger`)),
  messages: (id: string, page?: number, pageSize?: number) =>
    data(api.get<PagedResult<MessageDto>>(`/campaigns/${id}/messages`, paging(page, pageSize))),
  postMessage: (id: string, body: CreateMessageRequest) => data(api.post<MessageDto>(`/campaigns/${id}/messages`, body)),
  review: (id: string, body: CreateReviewRequest) => api.post(`/campaigns/${id}/reviews`, body),
  dispute: (id: string, body: CreateDisputeRequest) => data(api.post<DisputeDto>(`/campaigns/${id}/disputes`, body)),
}

export const milestonesApi = {
  submit: (id: string, deliverables?: AttachFileRequest[]) =>
    api.post(`/milestones/${id}/submit`, { deliverables: deliverables ?? null }),
  requestChanges: (id: string, notes: string) =>
    api.post(`/milestones/${id}/request-changes`, { notes } satisfies AdminDecisionRequest),
  approve: (id: string) => api.post(`/milestones/${id}/approve`),
  payout: (id: string) => api.post(`/milestones/${id}/payout`, null, idempotent()),
  attach: (id: string, file: AttachFileRequest) => data(api.post<FileAssetDto>(`/milestones/${id}/deliverables`, file)),
}

export const filesApi = {
  upload: async (file: File): Promise<AttachFileRequest> => {
    const form = new FormData()
    form.append('file', file)
    const asset = await data(api.post<FileAssetDto>('/files', form))
    return {
      storageKey: asset.storageKey,
      fileName: asset.fileName,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes,
    }
  },
}

export const adminApi = {
  pendingRequirements: (page?: number) =>
    data(api.get<PagedResult<RequirementDto>>('/admin/requirements/pending', paging(page))),
  openRequirement: (id: string, notes?: string) => api.post(`/admin/requirements/${id}/open`, { notes }),
  rejectRequirement: (id: string, notes?: string) => api.post(`/admin/requirements/${id}/reject`, { notes }),
  pendingProviders: (page?: number) => data(api.get<PagedResult<ProviderDto>>('/admin/providers/pending', paging(page))),
  verifyProvider: (id: string) => api.post(`/admin/providers/${id}/verify`),
  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
  disputes: (page?: number) => data(api.get<PagedResult<DisputeDto>>('/admin/disputes', paging(page))),
  resolveDispute: (id: string, notes?: string) => api.post(`/admin/disputes/${id}/resolve`, { notes }),
  campaigns: (page?: number) => data(api.get<PagedResult<CampaignDto>>('/admin/campaigns', paging(page))),
  audit: (page?: number) => data(api.get<PagedResult<AuditEventDto>>('/admin/audit', paging(page))),
  paymentExceptions: () => data(api.get<PaymentExceptionDto[]>('/admin/payments/exceptions')),
  settings: () => data(api.get<PlatformSettingsDto>('/admin/settings')),
  updateSettings: (platformFeePercent: number, allowedGeographies: string) =>
    data(api.put<PlatformSettingsDto>('/admin/settings', { platformFeePercent, allowedGeographies })),
  flagUser: (id: string, flagged: boolean) => api.post(`/admin/users/${id}/fraud`, { flagged }),
  privacy: () => data(api.get('/auth/me/privacy')),
  deleteAccount: () => api.post('/auth/me/delete'),
}
