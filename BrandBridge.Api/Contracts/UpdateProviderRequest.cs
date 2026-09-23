using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record UpdateProviderRequest(
    ProviderType ProviderType,
    string? Headline,
    string? Bio,
    string? City,
    string? Region,
    string Languages,
    string ServiceCategories,
    decimal? MinRate,
    decimal? MaxRate,
    string? Availability);
