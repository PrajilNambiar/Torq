using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record ProposalDto(
    Guid Id,
    Guid RequirementId,
    Guid ProviderProfileId,
    string? ProviderHeadline,
    ProposalStatus Status,
    PricingModel PricingModel,
    decimal PriceAmount,
    string Currency,
    string ScopeOfWork,
    string Deliverables,
    int TimelineDays,
    int RevisionsIncluded,
    string? CoverNote,
    IReadOnlyList<Guid> PortfolioItemIds,
    DateTime CreatedAt);
