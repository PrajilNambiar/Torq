using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

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
