using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Torq.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
        => Ok(await auth.RegisterAsync(request, ct));

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
        => Ok(await auth.LoginAsync(request, ct));

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<MeResponse>> Me([FromServices] ICurrentUser current, CancellationToken ct)
        => Ok(await auth.MeAsync(current.RequireUserId(), ct));
}
