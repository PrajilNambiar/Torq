namespace Torq.Api.Domain.Entities;

public class DisputeEvidence
{
    public Guid Id { get; set; }
    public Guid DisputeId { get; set; }
    public Dispute Dispute { get; set; } = null!;
    public Guid UploadedByUserId { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
