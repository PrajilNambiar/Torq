namespace BrandBridge.Api.Contracts;

public sealed record OpportunityDto(
    Guid Id,
    string Title,
    string Category,
    string Goal,
    string? Location,
    decimal? BudgetMin,
    decimal? BudgetMax,
    DateTime? ProposalDeadlineAt,
    DateTime CreatedAt);
