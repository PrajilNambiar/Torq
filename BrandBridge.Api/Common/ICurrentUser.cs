using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Common;

public interface ICurrentUser
{
    Guid? UserId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}
