using BrandBridge.Api.Data.Repositories.Interfaces;

namespace BrandBridge.Api.Data.Repositories;

public sealed class UnitOfWork(BrandBridgeDbContext db) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => db.SaveChangesAsync(cancellationToken);
}
