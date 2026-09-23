using BrandBridge.Api.Data.Repositories.Interfaces;
using BrandBridge.Api.Domain.Entities;

namespace BrandBridge.Api.Data.Repositories;

public sealed class AuditRepository(BrandBridgeDbContext db) : IAuditRepository
{
    public async Task WriteAsync(
        Guid? actorUserId,
        string entityType,
        Guid entityId,
        string action,
        string? metadata = null,
        CancellationToken cancellationToken = default)
    {
        db.AuditEvents.Add(new AuditEvent
        {
            Id = Guid.NewGuid(),
            ActorUserId = actorUserId,
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            MetadataJson = metadata,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
