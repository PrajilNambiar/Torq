using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record SocialAccountDto(Guid Id, SocialPlatform Platform, string Handle, string? ProfileUrl, bool IsOwnershipVerified, long? FollowerCount);
