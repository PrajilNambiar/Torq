import type {
  AuthResponse,
  BusinessDto,
  CampaignDto,
  CreatePortfolioRequest,
  CreateRequirementRequest,
  DisputeDto,
  MeResponse,
  MessageDto,
  MilestoneDto,
  OpportunityDto,
  PagedResult,
  PortfolioItemDto,
  ProposalDto,
  ProviderDto,
  ProviderServiceDto,
  RequirementDto,
  UpdateBusinessRequest,
  UpdateProviderRequest,
  UpsertProposalRequest,
  UpsertServiceRequest,
  UserRole,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5081'
const TOKEN_KEY = 'bb_token'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function idempotencyKey() {
  return crypto.randomUUID()
}

async function request<T>(
  path: string,
  options: RequestInit & { idempotent?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.idempotent) headers.set('Idempotency-Key', idempotencyKey())

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 204) return undefined as T

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = data?.error ?? data?.title ?? res.statusText ?? 'Request failed'
    throw new ApiError(message, res.status)
  }
  return data as T
}

export const api = {
  register: (body: {
    email: string
    password: string
    displayName: string
    role: UserRole
  }) =>
    request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () => request<MeResponse>('/api/v1/auth/me'),

  listRequirements: (page = 1) =>
    request<PagedResult<RequirementDto>>(`/api/v1/requirements?page=${page}&pageSize=20`),

  getRequirement: (id: string) => request<RequirementDto>(`/api/v1/requirements/${id}`),

  createRequirement: (body: CreateRequirementRequest) =>
    request<RequirementDto>('/api/v1/requirements', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateRequirement: (id: string, body: CreateRequirementRequest) =>
    request<RequirementDto>(`/api/v1/requirements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  submitRequirement: (id: string) =>
    request<void>(`/api/v1/requirements/${id}/submit`, { method: 'POST' }),

  listProposals: (requirementId: string) =>
    request<ProposalDto[]>(`/api/v1/requirements/${requirementId}/proposals`),

  shortlistProposal: (requirementId: string, proposalId: string) =>
    request<void>(`/api/v1/requirements/${requirementId}/proposals/${proposalId}/shortlist`, {
      method: 'POST',
    }),

  selectProposal: (requirementId: string, proposalId: string) =>
    request<CampaignDto>(`/api/v1/requirements/${requirementId}/select/${proposalId}`, {
      method: 'POST',
      idempotent: true,
    }),

  listOpportunities: (page = 1) =>
    request<PagedResult<OpportunityDto>>(`/api/v1/opportunities?page=${page}&pageSize=20`),

  upsertProposal: (body: UpsertProposalRequest) =>
    request<ProposalDto>('/api/v1/proposals', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  withdrawProposal: (id: string) =>
    request<void>(`/api/v1/proposals/${id}/withdraw`, { method: 'POST' }),

  listCampaigns: (page = 1) =>
    request<PagedResult<CampaignDto>>(`/api/v1/campaigns?page=${page}&pageSize=20`),

  getCampaign: (id: string) => request<CampaignDto>(`/api/v1/campaigns/${id}`),

  listMilestones: (campaignId: string) =>
    request<MilestoneDto[]>(`/api/v1/campaigns/${campaignId}/milestones`),

  fundCampaign: (id: string) =>
    request<void>(`/api/v1/campaigns/${id}/fund`, { method: 'POST', idempotent: true }),

  listMessages: (campaignId: string, page = 1) =>
    request<PagedResult<MessageDto>>(
      `/api/v1/campaigns/${campaignId}/messages?page=${page}&pageSize=50`,
    ),

  postMessage: (campaignId: string, body: string) =>
    request<MessageDto>(`/api/v1/campaigns/${campaignId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  addReview: (campaignId: string, rating: number, comment?: string) =>
    request<void>(`/api/v1/campaigns/${campaignId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),

  openDispute: (campaignId: string, reason: string) =>
    request<DisputeDto>(`/api/v1/campaigns/${campaignId}/disputes`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  submitMilestone: (id: string) =>
    request<void>(`/api/v1/milestones/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  requestChanges: (id: string, notes: string) =>
    request<void>(`/api/v1/milestones/${id}/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  approveMilestone: (id: string) =>
    request<void>(`/api/v1/milestones/${id}/approve`, { method: 'POST' }),

  payoutMilestone: (id: string) =>
    request<void>(`/api/v1/milestones/${id}/payout`, { method: 'POST', idempotent: true }),

  getBusiness: () => request<BusinessDto>('/api/v1/business/me'),

  updateBusiness: (body: UpdateBusinessRequest) =>
    request<BusinessDto>('/api/v1/business/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  getProvider: () => request<ProviderDto>('/api/v1/providers/me'),

  updateProvider: (body: UpdateProviderRequest) =>
    request<ProviderDto>('/api/v1/providers/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  listServices: () => request<ProviderServiceDto[]>('/api/v1/providers/me/services'),

  addService: (body: UpsertServiceRequest) =>
    request<ProviderServiceDto>('/api/v1/providers/me/services', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  listPortfolio: () => request<PortfolioItemDto[]>('/api/v1/providers/me/portfolio'),

  addPortfolio: (body: CreatePortfolioRequest) =>
    request<PortfolioItemDto>('/api/v1/providers/me/portfolio', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  adminPendingRequirements: (page = 1) =>
    request<PagedResult<RequirementDto>>(
      `/api/v1/admin/requirements/pending?page=${page}&pageSize=20`,
    ),

  adminOpenRequirement: (id: string, notes?: string) =>
    request<void>(`/api/v1/admin/requirements/${id}/open`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes ?? null }),
    }),

  adminRejectRequirement: (id: string, notes?: string) =>
    request<void>(`/api/v1/admin/requirements/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes ?? null }),
    }),

  adminPendingProviders: (page = 1) =>
    request<PagedResult<ProviderDto>>(`/api/v1/admin/providers/pending?page=${page}&pageSize=20`),

  adminVerifyProvider: (id: string) =>
    request<void>(`/api/v1/admin/providers/${id}/verify`, { method: 'POST' }),

  adminDisputes: (page = 1) =>
    request<PagedResult<DisputeDto>>(`/api/v1/admin/disputes?page=${page}&pageSize=20`),

  adminResolveDispute: (id: string, notes?: string) =>
    request<void>(`/api/v1/admin/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes ?? null }),
    }),

  adminCampaigns: (page = 1) =>
    request<PagedResult<CampaignDto>>(`/api/v1/admin/campaigns?page=${page}&pageSize=20`),
}
