using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record BusinessDto(
    Guid Id,
    string LegalName,
    string DisplayName,
    string? Industry,
    string? Description,
    string? Website,
    string? HeadquartersCity,
    string? HeadquartersRegion,
    string CountryCode,
    BusinessStatus Status);
