using System.Net;

namespace Torq.Api.Common;

public static class CurrentUserExtensions
{
    public static Guid RequireUserId(this ICurrentUser user)
    {
        if (user.UserId is null)
        {
            throw new AppException("Authentication required.", HttpStatusCode.Unauthorized);
        }

        return user.UserId.Value;
    }
}
