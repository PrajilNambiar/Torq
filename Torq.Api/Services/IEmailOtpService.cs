namespace Torq.Api.Services;

public interface IEmailOtpService
{
    Task SendAsync(string email, CancellationToken ct);
    Task VerifyAsync(string email, string code, CancellationToken ct);
}
