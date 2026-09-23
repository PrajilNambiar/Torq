using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class Dispute
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;
    public Guid OpenedByUserId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DisputeStatus Status { get; set; } = DisputeStatus.Open;
    public string? ResolutionNotes { get; set; }
    public Guid? ResolvedByUserId { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<DisputeEvidence> Evidence { get; set; } = new List<DisputeEvidence>();
}
