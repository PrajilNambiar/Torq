using Torq.Api.Contracts;

namespace Torq.Api.Common;

public interface IFileStorage
{
    Task<FileAssetDto> SaveAsync(IFormFile file, CancellationToken ct);
    bool Exists(string storageKey);
}
