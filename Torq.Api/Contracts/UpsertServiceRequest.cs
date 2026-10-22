using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record UpsertServiceRequest(
    string Category,
    string Title,
    string? Description,
    decimal? StartingPrice,
    PricingModel PricingModel,
    int? TypicalDeliveryDays);
