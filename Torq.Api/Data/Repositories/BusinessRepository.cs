using System.Net;
using Torq.Api.Common;
using Torq.Api.Data.Repositories.Interfaces;
using Torq.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Data.Repositories;

public sealed class BusinessRepository(TorqDbContext db) : IBusinessRepository
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
