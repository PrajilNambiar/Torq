namespace Torq.Api.Contracts;

public sealed record PortfolioItemDto(Guid Id, string Title, string? Description, string? ClientOrIndustry, string? MediaUrl, string? MetricsEvidence, int SortOrder);
