using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;

namespace BrandBridge.Api.Services;

public interface IAdminService
{
    Task<PagedResult<RequirementDto>> PendingRequirementsAsync(int page, int pageSize, CancellationToken ct);
    Task<PagedResult<ProviderDto>> PendingProvidersAsync(int page, int pageSize, CancellationToken ct);
    Task<PagedResult<DisputeDto>> ListDisputesAsync(int page, int pageSize, CancellationToken ct);
    Task<PagedResult<CampaignDto>> ListCampaignsAsync(int page, int pageSize, CancellationToken ct);
    Task OpenRequirementAsync(Guid adminUserId, Guid requirementId, AdminDecisionRequest request, CancellationToken ct);
    Task RejectRequirementAsync(Guid adminUserId, Guid requirementId, AdminDecisionRequest request, CancellationToken ct);
    Task VerifyProviderAsync(Guid adminUserId, Guid providerId, CancellationToken ct);
    Task SuspendUserAsync(Guid adminUserId, Guid userId, CancellationToken ct);
    Task ResolveDisputeAsync(Guid adminUserId, Guid disputeId, AdminDecisionRequest request, CancellationToken ct);
}
