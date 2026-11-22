using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Domain.Enums;
using Torq.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Torq.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/requirements")]
public sealed class RequirementsController(IMarketplaceService marketplace, ICoverageService coverage, ICurrentUser current) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<ActionResult<RequirementDto>> Create([FromBody] CreateRequirementRequest request, CancellationToken ct)
        => Ok(await marketplace.CreateRequirementAsync(current.RequireUserId(), request, ct));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<ActionResult<RequirementDto>> Update(Guid id, [FromBody] CreateRequirementRequest request, CancellationToken ct)
        => Ok(await marketplace.UpdateRequirementAsync(current.RequireUserId(), id, request, ct));

    [HttpPost("{id:guid}/submit")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
    {
        await marketplace.SubmitRequirementAsync(current.RequireUserId(), id, ct);
        return NoContent();
    }

    [HttpGet]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<ActionResult<PagedResult<RequirementDto>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await marketplace.ListMyRequirementsAsync(current.RequireUserId(), page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RequirementDto>> Get(Guid id, CancellationToken ct)
    {
        if (current.Role == UserRole.Provider)
        {
            await coverage.RecordViewAsync(id, ct);
        }

        return Ok(await marketplace.GetRequirementAsync(current.RequireUserId(), current.Role ?? UserRole.Business, id, ct));
    }

    [HttpGet("{id:guid}/questions")]
    public async Task<ActionResult<IReadOnlyList<RequirementQuestionDto>>> Questions(Guid id, CancellationToken ct)
        => Ok(await coverage.ListQuestionsAsync(current.RequireUserId(), current.Role ?? UserRole.Business, id, ct));

    [HttpPost("{id:guid}/questions")]
    public async Task<ActionResult<RequirementQuestionDto>> Ask(Guid id, [FromBody] AskQuestionRequest request, CancellationToken ct)
        => Ok(await coverage.AskAsync(current.RequireUserId(), current.Role ?? UserRole.Business, id, request.Body, ct));

    [HttpPost("{id:guid}/questions/{questionId:guid}/answer")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<ActionResult<RequirementQuestionDto>> Answer(Guid id, Guid questionId, [FromBody] AnswerQuestionRequest request, CancellationToken ct)
        => Ok(await coverage.AnswerAsync(current.RequireUserId(), id, questionId, request.Answer, ct));

    [HttpGet("{id:guid}/proposals")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<ActionResult<IReadOnlyList<ProposalDto>>> Proposals(Guid id, CancellationToken ct)
        => Ok(await marketplace.ListProposalsForRequirementAsync(current.RequireUserId(), id, ct));

    [HttpPost("{id:guid}/proposals/{proposalId:guid}/shortlist")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<IActionResult> Shortlist(Guid id, Guid proposalId, CancellationToken ct)
    {
        await marketplace.ShortlistAsync(current.RequireUserId(), id, proposalId, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/select/{proposalId:guid}")]
    [Authorize(Roles = nameof(UserRole.Business))]
    [Idempotent]
    public async Task<ActionResult<CampaignDto>> Select(Guid id, Guid proposalId, CancellationToken ct)
        => Ok(await marketplace.SelectProposalAsync(current.RequireUserId(), id, proposalId, ct));

    [HttpPost("{id:guid}/assets")]
    [Authorize(Roles = nameof(UserRole.Business))]
    public async Task<ActionResult<FileAssetDto>> Attach(Guid id, [FromBody] AttachFileRequest request, CancellationToken ct)
        => Ok(await marketplace.AttachRequirementAssetAsync(current.RequireUserId(), id, request, ct));
}
