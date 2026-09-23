using BrandBridge.Api.Domain.Entities;

namespace BrandBridge.Api.Data.Repositories.Interfaces;

public interface IBusinessRepository
{
    Task<Business?> GetByOwnerUserIdAsync(Guid userId, bool tracking, CancellationToken ct);
    Task<Business> RequireByOwnerUserIdAsync(Guid userId, bool tracking, CancellationToken ct);
    void Add(Business business);
}
