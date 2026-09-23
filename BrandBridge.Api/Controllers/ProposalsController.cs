using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;
using BrandBridge.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BrandBridge.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Provider))]
[Route("api/v1/proposals")]
[EnableRateLimiting("writes")]
public sealed class ProposalsController(IMarketplaceService marketplace, ICurrentUser current) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ProposalDto>> Upsert([FromBody] UpsertProposalRequest request, CancellationToken ct)
        => Ok(await marketplace.UpsertProposalAsync(current.RequireUserId(), request, ct));

    [HttpPost("{id:guid}/withdraw")]
    public async Task<IActionResult> Withdraw(Guid id, CancellationToken ct)
    {
        await marketplace.WithdrawProposalAsync(current.RequireUserId(), id, ct);
        return NoContent();
    }
}
