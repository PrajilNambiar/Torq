using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;
using BrandBridge.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BrandBridge.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/campaigns")]
public sealed class CampaignsController(IMarketplaceService marketplace, ICurrentUser current) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<CampaignDto>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await marketplace.ListCampaignsAsync(current.RequireUserId(), current.Role ?? UserRole.Business, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CampaignDto>> Get(Guid id, CancellationToken ct)
        => Ok(await marketplace.GetCampaignAsync(current.RequireUserId(), current.Role ?? UserRole.Business, id, ct));

    [HttpGet("{id:guid}/milestones")]
    public async Task<ActionResult<IReadOnlyList<MilestoneDto>>> Milestones(Guid id, CancellationToken ct)
        => Ok(await marketplace.ListMilestonesAsync(current.RequireUserId(), current.Role ?? UserRole.Business, id, ct));

    [HttpPost("{id:guid}/fund")]
    [Authorize(Roles = nameof(UserRole.Business))]
    [Idempotent]
    public async Task<IActionResult> Fund(Guid id, CancellationToken ct)
    {
        await marketplace.FundCampaignAsync(current.RequireUserId(), id, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<ActionResult<PagedResult<MessageDto>>> Messages(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await marketplace.ListMessagesAsync(current.RequireUserId(), current.Role ?? UserRole.Business, id, page, pageSize, ct));

    [HttpPost("{id:guid}/messages")]
    [EnableRateLimiting("writes")]
    public async Task<ActionResult<MessageDto>> PostMessage(Guid id, [FromBody] CreateMessageRequest request, CancellationToken ct)
        => Ok(await marketplace.PostMessageAsync(current.RequireUserId(), id, request, ct));

    [HttpPost("{id:guid}/reviews")]
    public async Task<IActionResult> Review(Guid id, [FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        await marketplace.AddReviewAsync(current.RequireUserId(), id, request, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/disputes")]
    public async Task<ActionResult<DisputeDto>> Dispute(Guid id, [FromBody] CreateDisputeRequest request, CancellationToken ct)
        => Ok(await marketplace.OpenDisputeAsync(current.RequireUserId(), id, request, ct));
}
