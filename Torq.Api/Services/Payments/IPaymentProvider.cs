namespace Torq.Api.Services.Payments;

public interface IPaymentProvider
{
    string Name { get; }

    ProviderResult Charge(decimal amount, string currency, string reference);

    ProviderResult SendPayout(decimal amount, string currency, string reference);

    ProviderResult Refund(string externalId, decimal amount, string currency);

    ProviderResult Cancel(string externalId);
}
