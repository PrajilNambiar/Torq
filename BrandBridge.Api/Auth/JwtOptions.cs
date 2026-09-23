namespace BrandBridge.Api.Auth;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "BrandBridge";
    public string Audience { get; set; } = "BrandBridge";
    public string Key { get; set; } = string.Empty;
    public int AccessTokenMinutes { get; set; } = 120;
}
