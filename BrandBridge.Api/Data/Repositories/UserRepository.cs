using BrandBridge.Api.Data.Repositories.Interfaces;
using BrandBridge.Api.Domain.Entities;
using BrandBridge.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace BrandBridge.Api.Data.Repositories;

public sealed class UserRepository(BrandBridgeDbContext db) : IUserRepository
{
    public async Task<ApplicationUser?> GetByIdAsync(Guid userId, bool tracking, CancellationToken ct)
    {
        var query = tracking ? db.Users.AsQueryable() : db.Users.AsNoTracking();
        return await query.FirstOrDefaultAsync(x => x.Id == userId, ct);
    }

    public Task<UserRole> GetRoleAsync(Guid userId, CancellationToken ct)
        => db.Users.AsNoTracking().Where(x => x.Id == userId).Select(x => x.Role).FirstAsync(ct);

    public async Task<(Guid? BusinessId, Guid? ProviderProfileId)> GetProfileIdsAsync(Guid userId, CancellationToken ct)
    {
        var businessId = await db.Businesses.AsNoTracking()
            .Where(x => x.OwnerUserId == userId)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(ct);
        var providerId = await db.ProviderProfiles.AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(ct);
        return (businessId, providerId);
    }
}
