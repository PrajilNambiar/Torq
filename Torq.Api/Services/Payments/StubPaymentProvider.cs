using System.Collections.Concurrent;

namespace Torq.Api.Services.Payments;

public sealed class StubPaymentProvider(IConfiguration configuration) : IPaymentProvider
{
    private readonly ConcurrentDictionary<string, int> _charges = new();

    public string Name => "stub";

    public ProviderResult Charge(decimal amount, string currency, string reference)
    {
        var attempt = _charges.AddOrUpdate(reference, 1, static (_, count) => count + 1);
        var outcome = Parse(configuration["Payments:StubOutcome"]);
        if (outcome == ProviderOutcome.Failed
            && string.Equals(configuration["Payments:FailFirstCharge"], "true", StringComparison.OrdinalIgnoreCase)
            && attempt > 1)
        {
            outcome = ProviderOutcome.Succeeded;
        }

        return new ProviderResult(Name, ExternalId(reference), outcome);
    }

    public ProviderResult SendPayout(decimal amount, string currency, string reference)
        => new(Name, ExternalId(reference), Parse(configuration["Payments:StubOutcome"]));

    public ProviderResult Refund(string externalId, decimal amount, string currency)
        => new(Name, externalId, FinalOutcome());

    public ProviderResult Cancel(string externalId)
        => new(Name, externalId, FinalOutcome());

    private ProviderOutcome FinalOutcome()
        => Parse(configuration["Payments:StubOutcome"]) == ProviderOutcome.Failed
            ? ProviderOutcome.Failed
            : ProviderOutcome.Succeeded;

    private string ExternalId(string reference)
    {
        if (string.Equals(configuration["Payments:DeterministicExternalIds"], "true", StringComparison.OrdinalIgnoreCase))
        {
            return $"stub-{reference}";
        }

        return $"stub-{Guid.NewGuid():N}";
    }

    private static ProviderOutcome Parse(string? value) => value?.Trim().ToLowerInvariant() switch
    {
        "failed" => ProviderOutcome.Failed,
        "processing" or "pending" => ProviderOutcome.Processing,
        _ => ProviderOutcome.Succeeded
    };
}
