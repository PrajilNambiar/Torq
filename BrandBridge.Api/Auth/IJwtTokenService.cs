using BrandBridge.Api.Domain.Entities;

namespace BrandBridge.Api.Auth;

public interface IJwtTokenService
{
    string CreateToken(ApplicationUser user);
}
