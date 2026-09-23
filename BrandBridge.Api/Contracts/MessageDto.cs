namespace BrandBridge.Api.Contracts;

public sealed record MessageDto(Guid Id, Guid? SenderUserId, string Body, DateTime CreatedAt, IReadOnlyList<FileAssetDto> Attachments);
