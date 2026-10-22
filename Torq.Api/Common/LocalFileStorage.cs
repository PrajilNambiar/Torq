using Torq.Api.Contracts;

namespace Torq.Api.Common;

public sealed class LocalFileStorage(IWebHostEnvironment env) : IFileStorage
{
    private static readonly HashSet<string> Allowed = [".png", ".jpg", ".jpeg", ".pdf", ".mp4", ".mov", ".webp", ".doc", ".docx"];

    public async Task<FileAssetDto> SaveAsync(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0)
        {
            throw new AppException("File is required.");
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!Allowed.Contains(ext))
        {
            throw new AppException("File type is not allowed.");
        }

        var folder = Path.Combine(env.ContentRootPath, "App_Data", "uploads");
        Directory.CreateDirectory(folder);
        var key = $"{Guid.NewGuid():N}{ext}";
        var path = Path.Combine(folder, key);
        await using var stream = File.Create(path);
        await file.CopyToAsync(stream, ct);
        return new FileAssetDto(Guid.Empty, file.FileName, key, file.ContentType ?? "application/octet-stream", file.Length);
    }

    public bool Exists(string storageKey)
    {
        if (string.IsNullOrWhiteSpace(storageKey) || storageKey.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
        {
            return false;
        }

        return File.Exists(Path.Combine(env.ContentRootPath, "App_Data", "uploads", storageKey));
    }
}
