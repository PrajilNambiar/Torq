using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record ProviderDto(
    Guid Id,
    ProviderType ProviderType,
    string? Headline,
    string? Bio,
    string? City,
    string? Region,
    string CountryCode,
    string Languages,
    string ServiceCategories,
    ProviderStatus Status,
    bool IdentityVerified,
    bool PortfolioVerified,
    bool SocialVerified);
