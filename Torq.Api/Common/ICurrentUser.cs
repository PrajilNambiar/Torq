using Torq.Api.Domain.Enums;

namespace Torq.Api.Common;

public interface ICurrentUser
{
    Guid? UserId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}
