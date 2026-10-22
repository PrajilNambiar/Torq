using Torq.Api.Domain.Enums;

namespace Torq.Api.Domain.Entities;

public class SocialAccount
{
    public Guid Id { get; set; }
    public Guid ProviderProfileId { get; set; }
    public ProviderProfile ProviderProfile { get; set; } = null!;
    public SocialPlatform Platform { get; set; }
    public string Handle { get; set; } = string.Empty;
    public string? ProfileUrl { get; set; }
    public bool IsOwnershipVerified { get; set; }
    public long? FollowerCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
