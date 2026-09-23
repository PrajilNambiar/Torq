using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class ProviderService
{
    public Guid Id { get; set; }
    public Guid ProviderProfileId { get; set; }
    public ProviderProfile ProviderProfile { get; set; } = null!;
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? StartingPrice { get; set; }
    public PricingModel PricingModel { get; set; } = PricingModel.Fixed;
    public int? TypicalDeliveryDays { get; set; }
    public bool IsActive { get; set; } = true;
}
