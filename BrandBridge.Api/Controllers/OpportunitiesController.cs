using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;
using BrandBridge.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BrandBridge.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Provider))]
[Route("api/v1/opportunities")]
public sealed class OpportunitiesController(IMarketplaceService marketplace, ICurrentUser current) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<OpportunityDto>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await marketplace.ListOpportunitiesAsync(current.RequireUserId(), page, pageSize, ct));
}
