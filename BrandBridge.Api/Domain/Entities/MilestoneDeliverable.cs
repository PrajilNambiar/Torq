namespace BrandBridge.Api.Domain.Entities;

public class MilestoneDeliverable
{
    public Guid Id { get; set; }
    public Guid MilestoneId { get; set; }
    public Milestone Milestone { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string StorageKey { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public string? ExternalUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
