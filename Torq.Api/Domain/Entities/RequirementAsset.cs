namespace Torq.Api.Domain.Entities;

public class RequirementAsset
{
    public Guid Id { get; set; }
    public Guid RequirementId { get; set; }
    public Requirement Requirement { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string StorageKey { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
