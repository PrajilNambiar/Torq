using Torq.Api.Domain.Enums;

namespace Torq.Api.Domain.Entities;

public class Payout
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;
    public Guid? MilestoneId { get; set; }
    public Guid ProviderProfileId { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal FeeAmount { get; set; }
    public decimal NetAmount { get; set; }
    public string Currency { get; set; } = "INR";
    public PayoutStatus Status { get; set; } = PayoutStatus.Pending;
    public string? ExternalPayoutId { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
