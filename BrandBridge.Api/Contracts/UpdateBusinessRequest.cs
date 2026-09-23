namespace BrandBridge.Api.Contracts;

public sealed record UpdateBusinessRequest(
    string LegalName,
    string DisplayName,
    string? Industry,
    string? Description,
    string? Website,
    string? HeadquartersCity,
    string? HeadquartersRegion,
    string? Gstin,
    string? BillingEmail);
