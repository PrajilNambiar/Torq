using BrandBridge.Api.Contracts;

namespace BrandBridge.Api.Common;

public interface IFileStorage
{
    Task<FileAssetDto> SaveAsync(IFormFile file, CancellationToken ct);
    bool Exists(string storageKey);
}
