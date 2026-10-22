namespace Torq.Api.Auth;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "Torq";
    public string Audience { get; set; } = "Torq";
    public string Key { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 120;
}
