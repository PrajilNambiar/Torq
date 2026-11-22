using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record CreateSocialRequest(
    SocialPlatform Platform,
    string Handle,
    string? ProfileUrl,
    long? FollowerCount,
    string? AudienceGeography = null,
    decimal? EngagementRate = null,
    string? UsageRights = null,
    bool DisclosureAcknowledged = false);
