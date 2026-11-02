using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Torq.Api.Tests;

public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"bb-{Guid.NewGuid():N}";

    protected virtual void ConfigureExtra(IDictionary<string, string?> settings)
    {
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            var settings = new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-key-must-be-at-least-32-characters!",
                ["Jwt:Issuer"] = "Torq",
                ["Jwt:Audience"] = "Torq",
                ["Testing:DbName"] = _dbName,
                ["Seed:AdminEmail"] = "admin@torq.local",
                ["Seed:AdminPassword"] = "Admin12345!",
                ["Payments:WebhookSecret"] = "test-webhook-secret",
                ["Payments:StubOutcome"] = "Succeeded",
                ["Otp:FixedCode"] = "123456"
            };
            ConfigureExtra(settings);
            config.AddInMemoryCollection(settings);
        });
    }
}

public sealed class FailedPaymentFactory : ApiFactory
{
    protected override void ConfigureExtra(IDictionary<string, string?> settings)
    {
        settings["Payments:StubOutcome"] = "Failed";
        settings["Payments:FailFirstCharge"] = "true";
    }
}

public sealed class PendingPaymentFactory : ApiFactory
{
    protected override void ConfigureExtra(IDictionary<string, string?> settings)
    {
        settings["Payments:StubOutcome"] = "Processing";
        settings["Payments:DeterministicExternalIds"] = "true";
    }
}

public sealed class ExpiredOtpFactory : ApiFactory
{
    protected override void ConfigureExtra(IDictionary<string, string?> settings)
    {
        settings["Otp:LifetimeSeconds"] = "0";
    }
}

public sealed class UnconfiguredWebhookFactory : ApiFactory
{
    protected override void ConfigureExtra(IDictionary<string, string?> settings)
    {
        settings["Payments:WebhookSecret"] = "";
    }
}
