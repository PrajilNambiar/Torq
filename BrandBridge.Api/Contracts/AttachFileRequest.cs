namespace BrandBridge.Api.Contracts;

public sealed record AttachFileRequest(string StorageKey, string FileName, string ContentType, long SizeBytes, string? ExternalUrl = null);
