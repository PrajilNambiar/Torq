using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record CreateSocialRequest(SocialPlatform Platform, string Handle, string? ProfileUrl, long? FollowerCount);
