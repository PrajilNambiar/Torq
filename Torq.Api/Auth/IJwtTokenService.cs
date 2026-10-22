using Torq.Api.Domain.Entities;

namespace Torq.Api.Auth;

public interface IJwtTokenService
{
    string CreateToken(ApplicationUser user);
}
