namespace Torq.Api.Data.Repositories.Interfaces;

public interface IAuditRepository
{
    Task WriteAsync(
        Guid? actorUserId,
        string entityType,
        Guid entityId,
        string action,
        string? metadata = null,
        CancellationToken cancellationToken = default);
}
