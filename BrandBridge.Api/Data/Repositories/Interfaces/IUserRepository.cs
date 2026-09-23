using BrandBridge.Api.Domain.Entities;
using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Data.Repositories.Interfaces;

public interface IUserRepository
{
    Task<ApplicationUser?> GetByIdAsync(Guid userId, bool tracking, CancellationToken ct);
    Task<UserRole> GetRoleAsync(Guid userId, CancellationToken ct);
    Task<(Guid? BusinessId, Guid? ProviderProfileId)> GetProfileIdsAsync(Guid userId, CancellationToken ct);
}
