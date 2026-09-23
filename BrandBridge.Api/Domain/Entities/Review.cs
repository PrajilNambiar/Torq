using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;
    public Guid ReviewerUserId { get; set; }
    public Guid RevieweeUserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public ReviewStatus Status { get; set; } = ReviewStatus.Published;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
