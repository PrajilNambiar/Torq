using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;
using BrandBridge.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BrandBridge.Api.Controllers;

[ApiController]
[Authorize(Roles = nameof(UserRole.Business))]
[Route("api/v1/business")]
public sealed class BusinessController(IMarketplaceService marketplace, ICurrentUser current) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<BusinessDto>> Get(CancellationToken ct)
        => Ok(await marketplace.GetBusinessAsync(current.RequireUserId(), ct));

    [HttpPut("me")]
    public async Task<ActionResult<BusinessDto>> Update([FromBody] UpdateBusinessRequest request, CancellationToken ct)
        => Ok(await marketplace.UpdateBusinessAsync(current.RequireUserId(), request, ct));
}
