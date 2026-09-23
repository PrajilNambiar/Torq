using System.Net;
using BrandBridge.Api.Common;
using BrandBridge.Api.Data.Repositories.Interfaces;
using BrandBridge.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BrandBridge.Api.Data.Repositories;

public sealed class BusinessRepository(BrandBridgeDbContext db) : IBusinessRepository
{
    public async Task<Business?> GetByOwnerUserIdAsync(Guid userId, bool tracking, CancellationToken ct)
    {
        var query = tracking ? db.Businesses.AsQueryable() : db.Businesses.AsNoTracking();
        return await query.FirstOrDefaultAsync(x => x.OwnerUserId == userId, ct);
    }

    public async Task<Business> RequireByOwnerUserIdAsync(Guid userId, bool tracking, CancellationToken ct)
        => await GetByOwnerUserIdAsync(userId, tracking, ct)
           ?? throw new AppException("Business profile not found.", HttpStatusCode.Forbidden);

    public void Add(Business business) => db.Businesses.Add(business);
}
