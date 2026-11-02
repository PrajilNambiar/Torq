using Torq.Api.Services.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Torq.Api.Controllers;

[ApiController]
[Route("api/v1/payments")]
public sealed class PaymentsController(IPaymentWebhookService webhooks) : ControllerBase
{
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync(ct);
        await webhooks.HandleAsync(body, Request.Headers["X-Torq-Signature"].ToString(), ct);
        return Ok();
    }
}
