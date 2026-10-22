using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record CreateSocialRequest(SocialPlatform Platform, string Handle, string? ProfileUrl, long? FollowerCount);
