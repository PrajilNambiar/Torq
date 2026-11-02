namespace Torq.Api.Services.Payments;

public interface IPaymentWebhookService
{
    Task HandleAsync(string body, string signature, CancellationToken ct);
}
