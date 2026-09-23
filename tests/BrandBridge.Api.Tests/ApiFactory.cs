using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace BrandBridge.Api.Tests;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"bb-{Guid.NewGuid():N}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-key-must-be-at-least-32-characters!",
                ["Jwt:Issuer"] = "BrandBridge",
                ["Jwt:Audience"] = "BrandBridge",
                ["Testing:DbName"] = _dbName,
                ["Seed:AdminEmail"] = "admin@brandbridge.local",
                ["Seed:AdminPassword"] = "Admin12345!"
            });
        });
    }
}
