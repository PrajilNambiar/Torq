namespace Torq.Api.Services.Payments;

public enum ProviderOutcome
{
    Processing = 1,
    Succeeded = 2,
    Failed = 3
}

public sealed record ProviderResult(string Provider, string ExternalId, ProviderOutcome Outcome);
