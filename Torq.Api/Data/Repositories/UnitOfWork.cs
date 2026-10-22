using Torq.Api.Data.Repositories.Interfaces;

namespace Torq.Api.Data.Repositories;

public sealed class UnitOfWork(TorqDbContext db) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
