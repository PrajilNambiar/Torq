using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Domain.Enums;
using Torq.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Torq.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/providers")]
public sealed class ProviderCardsController(ICoverageService coverage) : ControllerBase
{
    [HttpGet("{id:guid}/card")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<ActionResult<ProviderCardDto>> Card(Guid id, CancellationToken ct)
        => Ok(await coverage.ProviderCardAsync(id, ct));
}
