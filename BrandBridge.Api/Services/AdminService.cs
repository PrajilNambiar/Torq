using System.Net;
using AutoMapper;
using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Data.Repositories.Interfaces;
using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Services;

public sealed class AdminService(
    IRequirementRepository requirements,
    IProviderRepository providers,
    ICampaignRepository campaigns,
    IUserRepository users,
    IUnitOfWork unitOfWork,
    IAuditRepository audit,
    IMapper mapper) : IAdminService
{
    public async Task<PagedResult<RequirementDto>> PendingRequirementsAsync(int page, int pageSize, CancellationToken ct)
    {
        var result = await requirements.ListPendingAsync(page, pageSize, ct);
        return MapPage<Domain.Entities.Requirement, RequirementDto>(result);
    }

    public async Task<PagedResult<ProviderDto>> PendingProvidersAsync(int page, int pageSize, CancellationToken ct)
    {
        var result = await providers.ListPendingAsync(page, pageSize, ct);
        return MapPage<Domain.Entities.ProviderProfile, ProviderDto>(result);
    }

    public async Task<PagedResult<DisputeDto>> ListDisputesAsync(int page, int pageSize, CancellationToken ct)
    {
        var result = await campaigns.ListDisputesAsync(page, pageSize, ct);
        return MapPage<Domain.Entities.Dispute, DisputeDto>(result);
    }

    public async Task<PagedResult<CampaignDto>> ListCampaignsAsync(int page, int pageSize, CancellationToken ct)
    {
        var result = await campaigns.ListAllAsync(page, pageSize, ct);
        return MapPage<Domain.Entities.Campaign, CampaignDto>(result);
    }

    public async Task OpenRequirementAsync(Guid adminUserId, Guid requirementId, AdminDecisionRequest request, CancellationToken ct)
    {
        var requirement = await requirements.GetByIdAsync(requirementId, tracking: true, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        requirement.Status = RequirementStatus.Open;
        requirement.PublishedAt = DateTime.UtcNow;
        requirement.ModeratedByUserId = adminUserId;
        requirement.ModerationNotes = request.Notes;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(adminUserId, "Requirement", requirement.Id, "Opened", cancellationToken: ct);
    }

    public async Task RejectRequirementAsync(Guid adminUserId, Guid requirementId, AdminDecisionRequest request, CancellationToken ct)
    {
        var requirement = await requirements.GetByIdAsync(requirementId, tracking: true, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        requirement.Status = RequirementStatus.Cancelled;
        requirement.ModeratedByUserId = adminUserId;
        requirement.ModerationNotes = request.Notes;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(adminUserId, "Requirement", requirement.Id, "Rejected", cancellationToken: ct);
    }

    public async Task VerifyProviderAsync(Guid adminUserId, Guid providerId, CancellationToken ct)
    {
        var provider = await providers.GetByIdAsync(providerId, tracking: true, ct)
                       ?? throw new AppException("Provider not found.", HttpStatusCode.NotFound);
        provider.Status = ProviderStatus.Verified;
        provider.IdentityVerified = true;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(adminUserId, "Provider", provider.Id, "Verified", cancellationToken: ct);
    }

    public async Task SuspendUserAsync(Guid adminUserId, Guid userId, CancellationToken ct)
    {
        var user = await users.GetByIdAsync(userId, tracking: true, ct)
                   ?? throw new AppException("User not found.", HttpStatusCode.NotFound);
        user.Status = UserStatus.Suspended;
        var provider = await providers.GetByUserIdAsync(userId, tracking: true, ct);
        if (provider is not null)
        {
            provider.Status = ProviderStatus.Suspended;
        }

        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(adminUserId, "User", user.Id, "Suspended", cancellationToken: ct);
    }

    public async Task ResolveDisputeAsync(Guid adminUserId, Guid disputeId, AdminDecisionRequest request, CancellationToken ct)
    {
        var dispute = await campaigns.GetDisputeWithCampaignAsync(disputeId, ct)
                      ?? throw new AppException("Dispute not found.", HttpStatusCode.NotFound);
        dispute.Status = DisputeStatus.Resolved;
        dispute.ResolutionNotes = request.Notes;
        dispute.ResolvedByUserId = adminUserId;
        dispute.ResolvedAt = DateTime.UtcNow;
        dispute.Campaign.Status = CampaignStatus.Active;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(adminUserId, "Dispute", dispute.Id, "Resolved", cancellationToken: ct);
    }

    private PagedResult<TDto> MapPage<TEntity, TDto>(PagedResult<TEntity> page)
        => new()
        {
            Items = mapper.Map<List<TDto>>(page.Items),
            Page = page.Page,
            PageSize = page.PageSize,
            Total = page.Total
        };
}
