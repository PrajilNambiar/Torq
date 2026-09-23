using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

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
