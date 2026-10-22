using System.Net;
using Torq.Api.Common;
using Torq.Api.Data.Repositories.Interfaces;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Data.Repositories;

public sealed class ProviderRepository(TorqDbContext db) : IProviderRepository
{
    public async Task<ProviderProfile?> GetByUserIdAsync(Guid userId, bool tracking, CancellationToken ct)
    {
        var query = tracking ? db.ProviderProfiles.AsQueryable() : db.ProviderProfiles.AsNoTracking();
        return await query.FirstOrDefaultAsync(x => x.UserId == userId, ct);
    }

    public async Task<ProviderProfile> RequireByUserIdAsync(Guid userId, bool tracking, CancellationToken ct)
        => await GetByUserIdAsync(userId, tracking, ct)
           ?? throw new AppException("Provider profile not found.", HttpStatusCode.Forbidden);

    public async Task<ProviderProfile?> GetByIdAsync(Guid providerId, bool tracking, CancellationToken ct)
    {
        var query = tracking ? db.ProviderProfiles.AsQueryable() : db.ProviderProfiles.AsNoTracking();
        return await query.FirstOrDefaultAsync(x => x.Id == providerId, ct);
    }

    public Task<Guid> GetUserIdAsync(Guid providerProfileId, CancellationToken ct)
        => db.ProviderProfiles.AsNoTracking()
            .Where(x => x.Id == providerProfileId)
            .Select(x => x.UserId)
            .FirstAsync(ct);

    public void Add(ProviderProfile provider) => db.ProviderProfiles.Add(provider);
    public void AddService(ProviderService service) => db.ProviderServices.Add(service);

    public async Task<IReadOnlyList<ProviderService>> ListServicesAsync(Guid providerProfileId, CancellationToken ct)
        => await db.ProviderServices.AsNoTracking()
            .Where(x => x.ProviderProfileId == providerProfileId)
            .ToListAsync(ct);

    public void AddPortfolio(PortfolioItem item) => db.PortfolioItems.Add(item);

    public async Task<IReadOnlyList<PortfolioItem>> ListPortfolioAsync(Guid providerProfileId, CancellationToken ct)
        => await db.PortfolioItems.AsNoTracking()
            .Where(x => x.ProviderProfileId == providerProfileId)
            .ToListAsync(ct);

    public Task<bool> OwnsPortfolioItemAsync(Guid providerProfileId, Guid portfolioItemId, CancellationToken ct)
        => db.PortfolioItems.AnyAsync(x => x.Id == portfolioItemId && x.ProviderProfileId == providerProfileId, ct);

    public void AddSocial(SocialAccount account) => db.SocialAccounts.Add(account);

    public async Task<IReadOnlyList<SocialAccount>> ListSocialAsync(Guid providerProfileId, CancellationToken ct)
        => await db.SocialAccounts.AsNoTracking()
            .Where(x => x.ProviderProfileId == providerProfileId)
            .ToListAsync(ct);

    public async Task<PagedResult<ProviderProfile>> ListPendingAsync(int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.ProviderProfiles.AsNoTracking()
            .Where(x => x.Status == ProviderStatus.VerificationPending)
            .OrderBy(x => x.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<ProviderProfile> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }
}
