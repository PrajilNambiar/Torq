using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record SocialAccountDto(
    Guid Id,
    SocialPlatform Platform,
    string Handle,
    string? ProfileUrl,
    bool IsOwnershipVerified,
    long? FollowerCount,
    string? AudienceGeography = null,
    decimal? EngagementRate = null,
    string? UsageRights = null,
    bool DisclosureAcknowledged = false);
