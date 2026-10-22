using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Torq.Api.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Torq.Api.Auth;

public sealed class JwtTokenService(Microsoft.Extensions.Options.IOptions<JwtOptions> options) : IJwtTokenService
{
    public string CreateToken(ApplicationUser user)
    {
        var jwt = options.Value;
        if (string.IsNullOrWhiteSpace(jwt.Key) || jwt.Key.Length < 32)
        {
            throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");
        }

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("display_name", user.DisplayName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)) { KeyId = "torq" };
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            jwt.Issuer,
            jwt.Audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(jwt.AccessTokenMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
