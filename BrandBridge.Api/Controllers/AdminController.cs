using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;
using BrandBridge.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BrandBridge.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Admin))]
[Route("api/v1/admin")]
public sealed class AdminController(IAdminService admin, ICurrentUser current) : ControllerBase
{
    [HttpGet("requirements/pending")]
    public async Task<ActionResult<PagedResult<RequirementDto>>> Pending([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await admin.PendingRequirementsAsync(page, pageSize, ct));

    [HttpPost("requirements/{id:guid}/open")]
    public async Task<IActionResult> Open(Guid id, [FromBody] AdminDecisionRequest? request, CancellationToken ct)
    {
        await admin.OpenRequirementAsync(current.RequireUserId(), id, request ?? new AdminDecisionRequest(null), ct);
        return NoContent();
    }

    [HttpPost("requirements/{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] AdminDecisionRequest? request, CancellationToken ct)
    {
        await admin.RejectRequirementAsync(current.RequireUserId(), id, request ?? new AdminDecisionRequest(null), ct);
        return NoContent();
    }

    [HttpPost("providers/{id:guid}/verify")]
    public async Task<IActionResult> Verify(Guid id, CancellationToken ct)
    {
        await admin.VerifyProviderAsync(current.RequireUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("users/{id:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid id, CancellationToken ct)
    {
        await admin.SuspendUserAsync(current.RequireUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("disputes/{id:guid}/resolve")]
    public async Task<IActionResult> Resolve(Guid id, [FromBody] AdminDecisionRequest? request, CancellationToken ct)
    {
        await admin.ResolveDisputeAsync(current.RequireUserId(), id, request ?? new AdminDecisionRequest(null), ct);
        return NoContent();
    }

    [HttpGet("providers/pending")]
    public async Task<ActionResult<PagedResult<ProviderDto>>> PendingProviders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await admin.PendingProvidersAsync(page, pageSize, ct));

    [HttpGet("disputes")]
    public async Task<ActionResult<PagedResult<DisputeDto>>> Disputes([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await admin.ListDisputesAsync(page, pageSize, ct));

    [HttpGet("campaigns")]
    public async Task<ActionResult<PagedResult<CampaignDto>>> Campaigns([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await admin.ListCampaignsAsync(page, pageSize, ct));

    [HttpPost("disputes/{id:guid}/evidence")]
    public async Task<ActionResult<FileAssetDto>> Evidence(Guid id, [FromBody] AttachFileRequest request, [FromServices] IMarketplaceService marketplace, CancellationToken ct)
        => Ok(await marketplace.AttachDisputeEvidenceAsync(current.RequireUserId(), id, request, ct));
}
