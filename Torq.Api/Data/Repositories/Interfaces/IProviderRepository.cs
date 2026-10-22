using Torq.Api.Common;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;

namespace Torq.Api.Data.Repositories.Interfaces;

public interface IProviderRepository
{
    Task<ProviderProfile?> GetByUserIdAsync(Guid userId, bool tracking, CancellationToken ct);
    Task<ProviderProfile> RequireByUserIdAsync(Guid userId, bool tracking, CancellationToken ct);
    Task<ProviderProfile?> GetByIdAsync(Guid providerId, bool tracking, CancellationToken ct);
    Task<Guid> GetUserIdAsync(Guid providerProfileId, CancellationToken ct);
    void Add(ProviderProfile provider);
    void AddService(ProviderService service);
    Task<IReadOnlyList<ProviderService>> ListServicesAsync(Guid providerProfileId, CancellationToken ct);
    void AddPortfolio(PortfolioItem item);
    Task<IReadOnlyList<PortfolioItem>> ListPortfolioAsync(Guid providerProfileId, CancellationToken ct);
    Task<bool> OwnsPortfolioItemAsync(Guid providerProfileId, Guid portfolioItemId, CancellationToken ct);
    void AddSocial(SocialAccount account);
    Task<IReadOnlyList<SocialAccount>> ListSocialAsync(Guid providerProfileId, CancellationToken ct);
    Task<PagedResult<ProviderProfile>> ListPendingAsync(int page, int pageSize, CancellationToken ct);
}
