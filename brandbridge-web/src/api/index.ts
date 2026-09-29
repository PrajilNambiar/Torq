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
  ProviderServiceDto,
  RegisterRequest,
  RequirementDto,
  SocialAccountDto,
  UpdateBusinessRequest,
  UpdateProviderRequest,
  UpsertProposalRequest,
  UpsertServiceRequest,
} from '../types/api'

const data = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data)
const paging = (page = 1, pageSize = 20) => ({ params: { page, pageSize } })

export const authApi = {
  register: (body: RegisterRequest) => data(api.post<AuthResponse>('/auth/register', body)),
  login: (body: LoginRequest) => data(api.post<AuthResponse>('/auth/login', body)),
  me: () => data(api.get<MeResponse>('/auth/me')),
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
}

export const requirementsApi = {
  list: (page?: number, pageSize?: number) =>
    data(api.get<PagedResult<RequirementDto>>('/requirements', paging(page, pageSize))),
  get: (id: string) => data(api.get<RequirementDto>(`/requirements/${id}`)),
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
  list: (page?: number, pageSize?: number) =>
    data(api.get<PagedResult<OpportunityDto>>('/opportunities', paging(page, pageSize))),
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
}
