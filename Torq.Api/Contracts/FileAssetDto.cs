namespace Torq.Api.Contracts;

public sealed record FileAssetDto(Guid Id, string FileName, string StorageKey, string ContentType, long SizeBytes);
