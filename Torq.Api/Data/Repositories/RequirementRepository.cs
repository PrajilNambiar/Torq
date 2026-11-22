using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Data.Repositories.Interfaces;
using Torq.Api.Domain;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Data.Repositories;

public sealed class RequirementRepository(TorqDbContext db) : IRequirementRepository
{
    public async Task<Requirement?> GetByIdAsync(Guid id, bool tracking, CancellationToken ct)
    {
        var query = tracking ? db.Requirements.AsQueryable() : db.Requirements.AsNoTracking();
        return await query.Include(x => x.Assets).FirstOrDefaultAsync(x => x.Id == id, ct);
    }

    public Task<Requirement?> GetByIdAndBusinessAsync(Guid id, Guid businessId, CancellationToken ct)
        => db.Requirements.Include(x => x.Assets)
            .FirstOrDefaultAsync(x => x.Id == id && x.BusinessId == businessId, ct);

    public Task<bool> ExistsForBusinessAsync(Guid id, Guid businessId, CancellationToken ct)
        => db.Requirements.AsNoTracking().AnyAsync(x => x.Id == id && x.BusinessId == businessId, ct);

    public void Add(Requirement requirement) => db.Requirements.Add(requirement);
    public void AddAsset(RequirementAsset asset) => db.RequirementAssets.Add(asset);

    public async Task<PagedResult<Requirement>> ListByBusinessAsync(Guid businessId, int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.Requirements.AsNoTracking().Where(x => x.BusinessId == businessId);
        var total = await query.CountAsync(ct);
        var items = await query.Include(x => x.Assets)
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return new PagedResult<Requirement> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }

    public async Task<PagedResult<Requirement>> ListEligibleAsync(IReadOnlyCollection<string> serviceCategories, int page, int pageSize, OpportunityFilter? filter, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.Requirements.AsNoTracking()
            .Where(RequirementMatcher.EligibleFor(serviceCategories));
        if (!string.IsNullOrWhiteSpace(filter?.Location))
        {
            var location = filter.Location.Trim().ToLower();
            query = query.Where(x => x.Location != null && x.Location.ToLower().Contains(location));
        }

        if (!string.IsNullOrWhiteSpace(filter?.Language))
        {
            var language = filter.Language.Trim().ToLower();
            query = query.Where(x => x.Languages.ToLower().Contains(language));
        }

        if (filter?.BudgetMin is not null)
        {
            var min = filter.BudgetMin.Value;
            query = query.Where(x => x.BudgetMax == null || x.BudgetMax >= min);
        }

        if (filter?.BudgetMax is not null)
        {
            var max = filter.BudgetMax.Value;
            query = query.Where(x => x.BudgetMin == null || x.BudgetMin <= max);
        }

        if (!string.IsNullOrWhiteSpace(filter?.Industry))
        {
            var industry = filter.Industry.Trim().ToLower();
            query = query.Where(x => x.Business.Industry != null && x.Business.Industry.ToLower().Contains(industry));
        }

        query = query.OrderByDescending(x => x.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<Requirement> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }

    public async Task<PagedResult<Requirement>> ListPendingAsync(int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.Requirements.AsNoTracking()
            .Where(x => x.Status == RequirementStatus.UnderReview);
        var total = await query.CountAsync(ct);
        var items = await query.Include(x => x.Assets)
            .OrderBy(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        return new PagedResult<Requirement> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }
}
