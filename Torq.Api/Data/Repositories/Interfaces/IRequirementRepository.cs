using Torq.Api.Common;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;

namespace Torq.Api.Data.Repositories.Interfaces;

public interface IRequirementRepository
{
    Task<Requirement?> GetByIdAsync(Guid id, bool tracking, CancellationToken ct);
    Task<Requirement?> GetByIdAndBusinessAsync(Guid id, Guid businessId, CancellationToken ct);
    Task<bool> ExistsForBusinessAsync(Guid id, Guid businessId, CancellationToken ct);
    void Add(Requirement requirement);
    void AddAsset(RequirementAsset asset);
    Task<PagedResult<Requirement>> ListByBusinessAsync(Guid businessId, int page, int pageSize, CancellationToken ct);
    Task<PagedResult<Requirement>> ListEligibleAsync(IReadOnlyCollection<string> serviceCategories, int page, int pageSize, CancellationToken ct);
    Task<PagedResult<Requirement>> ListPendingAsync(int page, int pageSize, CancellationToken ct);
}
