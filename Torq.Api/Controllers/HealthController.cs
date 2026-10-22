using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Torq.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok", service = "Torq.Api" });
}
