using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record UpsertServiceRequest(
    string Category,
    string Title,
    string? Description,
    decimal? StartingPrice,
    PricingModel PricingModel,
    int? TypicalDeliveryDays);
