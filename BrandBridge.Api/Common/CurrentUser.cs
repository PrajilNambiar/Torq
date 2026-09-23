using System.Security.Claims;
using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Common;

public sealed class CurrentUser : ICurrentUser
{
    public CurrentUser(IHttpContextAccessor accessor)
    {
        var principal = accessor.HttpContext?.User;
        IsAuthenticated = principal?.Identity?.IsAuthenticated == true;
        var id = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        UserId = Guid.TryParse(id, out var guid) ? guid : null;
        var role = principal?.FindFirstValue(ClaimTypes.Role);
        Role = Enum.TryParse<UserRole>(role, out var parsed) ? parsed : null;
    }

    public Guid? UserId { get; }
    public UserRole? Role { get; }
    public bool IsAuthenticated { get; }
}
