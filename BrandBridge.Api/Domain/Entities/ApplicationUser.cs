using BrandBridge.Api.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace BrandBridge.Api.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public string CountryCode { get; set; } = "IN";
    public string? TimeZone { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public Business? Business { get; set; }
    public ProviderProfile? ProviderProfile { get; set; }
}
