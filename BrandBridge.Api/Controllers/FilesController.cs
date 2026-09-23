using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BrandBridge.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/files")]
public sealed class FilesController(IFileStorage storage) : ControllerBase
{
    [HttpPost]
    [RequestSizeLimit(20_000_000)]
    [EnableRateLimiting("writes")]
    public async Task<ActionResult<FileAssetDto>> Upload(IFormFile file, CancellationToken ct)
        => Ok(await storage.SaveAsync(file, ct));
}
