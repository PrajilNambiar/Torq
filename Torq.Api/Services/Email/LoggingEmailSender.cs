namespace Torq.Api.Services.Email;

public sealed class LoggingEmailSender(ILogger<LoggingEmailSender> logger, IHostEnvironment environment) : IEmailSender
{
    public Task SendAsync(string to, string subject, string body, CancellationToken ct)
    {
        if (environment.IsProduction())
        {
            logger.LogInformation("Email sent to {Email} with subject {Subject}", to, subject);
        }
        else
        {
            logger.LogInformation("Email to {Email} subject {Subject}: {Body}", to, subject, body);
        }

        return Task.CompletedTask;
    }
}
