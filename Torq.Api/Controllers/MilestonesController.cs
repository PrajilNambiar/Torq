using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Domain.Enums;
using Torq.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Torq.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/milestones")]
public sealed class MilestonesController(IMarketplaceService marketplace, ICurrentUser current) : ControllerBase
{
    [HttpPost("{id:guid}/submit")]
    [Authorize(Roles = nameof(UserRole.Provider))]
    public async Task<IActionResult> Submit(Guid id, [FromBody] SubmitMilestoneRequest? request, CancellationToken ct)
    {
        await marketplace.SubmitMilestoneAsync(current.RequireUserId(), id, request, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/request-changes")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<IActionResult> RequestChanges(Guid id, [FromBody] AdminDecisionRequest request, CancellationToken ct)
    {
        await marketplace.RequestChangesAsync(current.RequireUserId(), id, request.Notes ?? string.Empty, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        await marketplace.ApproveMilestoneAsync(current.RequireUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/payout")]
    [Authorize(Roles = nameof(UserRole.Business))]
    [Idempotent]
    public async Task<IActionResult> Payout(Guid id, CancellationToken ct)
    {
        await marketplace.PayoutMilestoneAsync(current.RequireUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/deliverables")]
    [Authorize(Roles = nameof(UserRole.Provider))]
    public async Task<ActionResult<FileAssetDto>> Attach(Guid id, [FromBody] AttachFileRequest request, CancellationToken ct)
        => Ok(await marketplace.AttachMilestoneDeliverableAsync(current.RequireUserId(), id, request, ct));
}
