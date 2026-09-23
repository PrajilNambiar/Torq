using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record UpsertProposalRequest(
    Guid RequirementId,
    PricingModel PricingModel,
    decimal PriceAmount,
    string ScopeOfWork,
    string Deliverables,
    int TimelineDays,
    string? TimelineNotes,
    string? ExpectedMetrics,
    int RevisionsIncluded,
    string? ClientRequirements,
    string? OptionalAddOns,
    string? CoverNote,
    bool Submit,
    IReadOnlyList<ProposalMilestoneDto>? Milestones = null,
    IReadOnlyList<Guid>? PortfolioItemIds = null);
