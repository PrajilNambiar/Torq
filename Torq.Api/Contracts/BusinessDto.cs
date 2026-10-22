using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

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
