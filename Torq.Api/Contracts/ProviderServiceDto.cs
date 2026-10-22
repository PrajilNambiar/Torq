using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record ProviderServiceDto(Guid Id, string Category, string Title, string? Description, decimal? StartingPrice, PricingModel PricingModel, int? TypicalDeliveryDays, bool IsActive);
