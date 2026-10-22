namespace Torq.Api.Domain.Entities;

public class AuditEvent
{
    public Guid Id { get; set; }
    public Guid? ActorUserId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
