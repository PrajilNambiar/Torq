using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record ProviderServiceDto(Guid Id, string Category, string Title, string? Description, decimal? StartingPrice, PricingModel PricingModel, int? TypicalDeliveryDays, bool IsActive);
