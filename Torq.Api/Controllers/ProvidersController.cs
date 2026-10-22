using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Domain.Enums;
using Torq.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Torq.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Provider))]
[Route("api/v1/providers")]
public sealed class ProvidersController(IMarketplaceService marketplace, ICurrentUser current) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<ProviderDto>> Get(CancellationToken ct)
        => Ok(await marketplace.GetProviderAsync(current.RequireUserId(), ct));

    [HttpPut("me")]
    public async Task<ActionResult<ProviderDto>> Update([FromBody] UpdateProviderRequest request, CancellationToken ct)
        => Ok(await marketplace.UpdateProviderAsync(current.RequireUserId(), request, ct));

    [HttpPost("me/services")]
    public async Task<IActionResult> AddService([FromBody] UpsertServiceRequest request, CancellationToken ct)
        => Ok(await marketplace.AddServiceAsync(current.RequireUserId(), request, ct));

    [HttpPost("me/portfolio")]
    public async Task<IActionResult> AddPortfolio([FromBody] CreatePortfolioRequest request, CancellationToken ct)
        => Ok(await marketplace.AddPortfolioAsync(current.RequireUserId(), request, ct));

    [HttpPost("me/social")]
    public async Task<IActionResult> AddSocial([FromBody] CreateSocialRequest request, CancellationToken ct)
        => Ok(await marketplace.AddSocialAsync(current.RequireUserId(), request, ct));

    [HttpGet("me/services")]
    public async Task<ActionResult<IReadOnlyList<ProviderServiceDto>>> Services(CancellationToken ct)
        => Ok(await marketplace.ListServicesAsync(current.RequireUserId(), ct));

    [HttpGet("me/portfolio")]
    public async Task<ActionResult<IReadOnlyList<PortfolioItemDto>>> Portfolio(CancellationToken ct)
        => Ok(await marketplace.ListPortfolioAsync(current.RequireUserId(), ct));

    [HttpGet("me/social")]
    public async Task<ActionResult<IReadOnlyList<SocialAccountDto>>> Social(CancellationToken ct)
        => Ok(await marketplace.ListSocialAsync(current.RequireUserId(), ct));
}
