using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record CampaignDto(
    Guid Id,
    Guid RequirementId,
    Guid ProposalId,
    CampaignStatus Status,
    decimal AgreedPrice,
    string Currency,
    decimal PlatformFeeAmount,
    DateTime CreatedAt);
