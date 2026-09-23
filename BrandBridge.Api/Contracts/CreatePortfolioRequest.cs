namespace BrandBridge.Api.Contracts;

public sealed record CreatePortfolioRequest(string Title, string? Description, string? ClientOrIndustry, string? MediaUrl, string? MetricsEvidence);
