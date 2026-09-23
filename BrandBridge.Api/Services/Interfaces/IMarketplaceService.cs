using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Services;

public interface IMarketplaceService
{
    Task<BusinessDto> GetBusinessAsync(Guid userId, CancellationToken ct);
    Task<BusinessDto> UpdateBusinessAsync(Guid userId, UpdateBusinessRequest request, CancellationToken ct);
    Task<ProviderDto> GetProviderAsync(Guid userId, CancellationToken ct);
    Task<ProviderDto> UpdateProviderAsync(Guid userId, UpdateProviderRequest request, CancellationToken ct);
    Task<ProviderServiceDto> AddServiceAsync(Guid userId, UpsertServiceRequest request, CancellationToken ct);
    Task<IReadOnlyList<ProviderServiceDto>> ListServicesAsync(Guid userId, CancellationToken ct);
    Task<PortfolioItemDto> AddPortfolioAsync(Guid userId, CreatePortfolioRequest request, CancellationToken ct);
    Task<IReadOnlyList<PortfolioItemDto>> ListPortfolioAsync(Guid userId, CancellationToken ct);
    Task<SocialAccountDto> AddSocialAsync(Guid userId, CreateSocialRequest request, CancellationToken ct);
    Task<IReadOnlyList<SocialAccountDto>> ListSocialAsync(Guid userId, CancellationToken ct);
    Task<FileAssetDto> AttachRequirementAssetAsync(Guid userId, Guid requirementId, AttachFileRequest request, CancellationToken ct);
    Task<RequirementDto> CreateRequirementAsync(Guid userId, CreateRequirementRequest request, CancellationToken ct);
    Task<RequirementDto> UpdateRequirementAsync(Guid userId, Guid id, CreateRequirementRequest request, CancellationToken ct);
    Task SubmitRequirementAsync(Guid userId, Guid id, CancellationToken ct);
    Task<PagedResult<RequirementDto>> ListMyRequirementsAsync(Guid userId, int page, int pageSize, CancellationToken ct);
    Task<RequirementDto> GetRequirementAsync(Guid userId, UserRole role, Guid id, CancellationToken ct);
    Task<PagedResult<OpportunityDto>> ListOpportunitiesAsync(Guid userId, int page, int pageSize, CancellationToken ct);
    Task<ProposalDto> UpsertProposalAsync(Guid userId, UpsertProposalRequest request, CancellationToken ct);
    Task WithdrawProposalAsync(Guid userId, Guid proposalId, CancellationToken ct);
    Task<IReadOnlyList<ProposalDto>> ListProposalsForRequirementAsync(Guid userId, Guid requirementId, CancellationToken ct);
    Task ShortlistAsync(Guid userId, Guid requirementId, Guid proposalId, CancellationToken ct);
    Task<CampaignDto> SelectProposalAsync(Guid userId, Guid requirementId, Guid proposalId, CancellationToken ct);
    Task<PagedResult<CampaignDto>> ListCampaignsAsync(Guid userId, UserRole role, int page, int pageSize, CancellationToken ct);
    Task<CampaignDto> GetCampaignAsync(Guid userId, UserRole role, Guid id, CancellationToken ct);
    Task<IReadOnlyList<MilestoneDto>> ListMilestonesAsync(Guid userId, UserRole role, Guid campaignId, CancellationToken ct);
    Task SubmitMilestoneAsync(Guid userId, Guid milestoneId, SubmitMilestoneRequest? request, CancellationToken ct);
    Task RequestChangesAsync(Guid userId, Guid milestoneId, string notes, CancellationToken ct);
    Task ApproveMilestoneAsync(Guid userId, Guid milestoneId, CancellationToken ct);
    Task FundCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct);
    Task PayoutMilestoneAsync(Guid userId, Guid milestoneId, CancellationToken ct);
    Task<MessageDto> PostMessageAsync(Guid userId, Guid campaignId, CreateMessageRequest request, CancellationToken ct);
    Task<PagedResult<MessageDto>> ListMessagesAsync(Guid userId, UserRole role, Guid campaignId, int page, int pageSize, CancellationToken ct);
    Task AddReviewAsync(Guid userId, Guid campaignId, CreateReviewRequest request, CancellationToken ct);
    Task<DisputeDto> OpenDisputeAsync(Guid userId, Guid campaignId, CreateDisputeRequest request, CancellationToken ct);
    Task<FileAssetDto> AttachMilestoneDeliverableAsync(Guid userId, Guid milestoneId, AttachFileRequest request, CancellationToken ct);
    Task<FileAssetDto> AttachDisputeEvidenceAsync(Guid userId, Guid disputeId, AttachFileRequest request, CancellationToken ct);
}
