using System.Net;
using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Data;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Services;

public interface ICoverageService
{
    Task RecordViewAsync(Guid requirementId, CancellationToken ct);
    Task<IReadOnlyList<RequirementQuestionDto>> ListQuestionsAsync(Guid userId, UserRole role, Guid requirementId, CancellationToken ct);
    Task<RequirementQuestionDto> AskAsync(Guid userId, UserRole role, Guid requirementId, string body, CancellationToken ct);
    Task<RequirementQuestionDto> AnswerAsync(Guid userId, Guid requirementId, Guid questionId, string answer, CancellationToken ct);
    Task<ProviderCardDto> ProviderCardAsync(Guid providerProfileId, CancellationToken ct);
    Task<IReadOnlyList<EarningDto>> EarningsAsync(Guid userId, CancellationToken ct);
    Task SetPayoutAccountAsync(Guid userId, string label, CancellationToken ct);
    Task<IReadOnlyList<LedgerEntryDto>> LedgerAsync(Guid userId, UserRole role, Guid campaignId, CancellationToken ct);
    Task<PagedResult<AuditEventDto>> AuditAsync(int page, int pageSize, CancellationToken ct);
    Task<IReadOnlyList<PaymentExceptionDto>> PaymentExceptionsAsync(CancellationToken ct);
    Task<PlatformSettingsDto> GetSettingsAsync(CancellationToken ct);
    Task<PlatformSettingsDto> UpdateSettingsAsync(UpdatePlatformSettingsRequest request, CancellationToken ct);
    Task FlagUserAsync(Guid userId, bool flagged, CancellationToken ct);
}

public sealed class CoverageService(TorqDbContext db) : ICoverageService
{
    public async Task RecordViewAsync(Guid requirementId, CancellationToken ct)
    {
        var row = await db.Requirements.FirstOrDefaultAsync(x => x.Id == requirementId, ct);
        if (row is null)
        {
            return;
        }

        row.ViewCount++;
        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<RequirementQuestionDto>> ListQuestionsAsync(Guid userId, UserRole role, Guid requirementId, CancellationToken ct)
    {
        await RequireBriefAccessAsync(userId, role, requirementId, ct);
        var rows = await db.RequirementQuestions.AsNoTracking()
            .Where(x => x.RequirementId == requirementId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(ct);
        return rows.Select(MapQuestion).ToList();
    }

    public async Task<RequirementQuestionDto> AskAsync(Guid userId, UserRole role, Guid requirementId, string body, CancellationToken ct)
    {
        ContactLeakGuard.EnsureClean(body);
        await RequireBriefAccessAsync(userId, role, requirementId, ct);
        var row = new RequirementQuestion
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            AuthorUserId = userId,
            Body = body.Trim()
        };
        db.RequirementQuestions.Add(row);
        await db.SaveChangesAsync(ct);
        return MapQuestion(row);
    }

    public async Task<RequirementQuestionDto> AnswerAsync(Guid userId, Guid requirementId, Guid questionId, string answer, CancellationToken ct)
    {
        ContactLeakGuard.EnsureClean(answer);
        var business = await db.Businesses.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerUserId == userId, ct)
                       ?? throw new AppException("Business profile not found.", HttpStatusCode.Forbidden);
        var requirement = await db.Requirements.AsNoTracking().FirstOrDefaultAsync(x => x.Id == requirementId && x.BusinessId == business.Id, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        var row = await db.RequirementQuestions.FirstOrDefaultAsync(x => x.Id == questionId && x.RequirementId == requirement.Id, ct)
                  ?? throw new AppException("Question not found.", HttpStatusCode.NotFound);
        row.Answer = answer.Trim();
        row.AnsweredAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return MapQuestion(row);
    }

    public async Task<ProviderCardDto> ProviderCardAsync(Guid providerProfileId, CancellationToken ct)
    {
        var provider = await db.ProviderProfiles.AsNoTracking()
                           .Include(x => x.PortfolioItems)
                           .FirstOrDefaultAsync(x => x.Id == providerProfileId, ct)
                       ?? throw new AppException("Provider not found.", HttpStatusCode.NotFound);
        var stats = await ReputationAsync(provider.UserId, provider.Id, ct);
        return new ProviderCardDto(
            provider.Id,
            provider.Headline,
            provider.Status,
            provider.IdentityVerified,
            provider.PortfolioVerified,
            provider.SocialVerified,
            stats.Average,
            stats.Reviews,
            stats.Completed,
            provider.PortfolioItems.Count,
            Badge(stats.Average, stats.Completed),
            stats.ResponseHours,
            provider.PortfolioItems.OrderByDescending(x => x.CreatedAt).Take(4).Select(x => x.Title).ToList());
    }

    public async Task<IReadOnlyList<EarningDto>> EarningsAsync(Guid userId, CancellationToken ct)
    {
        var provider = await db.ProviderProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, ct)
                       ?? throw new AppException("Provider profile not found.", HttpStatusCode.Forbidden);
        var rows = await db.Payouts.AsNoTracking()
            .Where(x => x.ProviderProfileId == provider.Id)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
        return rows.Select(x => new EarningDto(x.Id, x.CampaignId, x.GrossAmount, x.FeeAmount, x.NetAmount, x.Currency, x.Status.ToString(), x.CreatedAt)).ToList();
    }

    public async Task SetPayoutAccountAsync(Guid userId, string label, CancellationToken ct)
    {
        var trimmed = label.Trim();
        if (trimmed.Length is < 4 or > 120)
        {
            throw new AppException("Enter a payout account label between 4 and 120 characters.");
        }

        if (trimmed.Any(char.IsDigit) && trimmed.Count(char.IsDigit) >= 12)
        {
            throw new AppException("Store a label such as bank name and last four digits, not a full account number.");
        }

        var provider = await db.ProviderProfiles.FirstOrDefaultAsync(x => x.UserId == userId, ct)
                       ?? throw new AppException("Provider profile not found.", HttpStatusCode.Forbidden);
        provider.PayoutAccountLabel = trimmed;
        provider.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<LedgerEntryDto>> LedgerAsync(Guid userId, UserRole role, Guid campaignId, CancellationToken ct)
    {
        var campaign = await db.Campaigns.AsNoTracking().FirstOrDefaultAsync(x => x.Id == campaignId, ct)
                       ?? throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
        if (role == UserRole.Business)
        {
            var business = await db.Businesses.AsNoTracking().FirstOrDefaultAsync(x => x.OwnerUserId == userId, ct);
            if (business is null || business.Id != campaign.BusinessId)
            {
                throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
            }
        }
        else if (role == UserRole.Provider)
        {
            var provider = await db.ProviderProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, ct);
            if (provider is null || provider.Id != campaign.ProviderProfileId)
            {
                throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
            }
        }

        var payments = await db.Payments.AsNoTracking().Where(x => x.CampaignId == campaignId).ToListAsync(ct);
        var payouts = await db.Payouts.AsNoTracking().Where(x => x.CampaignId == campaignId).ToListAsync(ct);
        return payments.Select(x => new LedgerEntryDto("payment", x.Id, x.Amount, x.Currency, x.Status.ToString(), x.ExternalPaymentId, x.CreatedAt))
            .Concat(payouts.Select(x => new LedgerEntryDto("payout", x.Id, x.NetAmount, x.Currency, x.Status.ToString(), x.ExternalPayoutId, x.CreatedAt)))
            .OrderBy(x => x.CreatedAt)
            .ToList();
    }

    public async Task<PagedResult<AuditEventDto>> AuditAsync(int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.AuditEvents.AsNoTracking().OrderByDescending(x => x.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => new AuditEventDto(x.Id, x.ActorUserId, x.EntityType, x.EntityId, x.Action, x.CreatedAt))
            .ToListAsync(ct);
        return new PagedResult<AuditEventDto> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }

    public async Task<IReadOnlyList<PaymentExceptionDto>> PaymentExceptionsAsync(CancellationToken ct)
    {
        var rows = await db.Payments.AsNoTracking()
            .Where(x => x.Status == PaymentStatus.Failed || x.Status == PaymentStatus.Processing)
            .OrderByDescending(x => x.CreatedAt)
            .Take(50)
            .ToListAsync(ct);
        return rows.Select(x => new PaymentExceptionDto(x.Id, x.CampaignId, x.Amount, x.Currency, x.Status.ToString(), x.CreatedAt)).ToList();
    }

    public async Task<PlatformSettingsDto> GetSettingsAsync(CancellationToken ct)
    {
        var row = await SettingsAsync(ct);
        return new PlatformSettingsDto(row.PlatformFeePercent, row.AllowedGeographies);
    }

    public async Task<PlatformSettingsDto> UpdateSettingsAsync(UpdatePlatformSettingsRequest request, CancellationToken ct)
    {
        if (request.PlatformFeePercent is < 0 or > 40)
        {
            throw new AppException("Platform fee must be between 0 and 40 percent.");
        }

        var row = await SettingsAsync(ct);
        row.PlatformFeePercent = request.PlatformFeePercent;
        row.AllowedGeographies = string.IsNullOrWhiteSpace(request.AllowedGeographies) ? "IN" : request.AllowedGeographies.Trim();
        row.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return new PlatformSettingsDto(row.PlatformFeePercent, row.AllowedGeographies);
    }

    public async Task FlagUserAsync(Guid userId, bool flagged, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct)
                   ?? throw new AppException("User not found.", HttpStatusCode.NotFound);
        user.FraudFlagged = flagged;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    private async Task RequireBriefAccessAsync(Guid userId, UserRole role, Guid requirementId, CancellationToken ct)
    {
        var requirement = await db.Requirements.AsNoTracking().FirstOrDefaultAsync(x => x.Id == requirementId, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        if (role == UserRole.Admin)
        {
            return;
        }

        if (role == UserRole.Business)
        {
            var owns = await db.Businesses.AnyAsync(x => x.OwnerUserId == userId && x.Id == requirement.BusinessId, ct);
            if (!owns)
            {
                throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
            }

            return;
        }

        var provider = await db.ProviderProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, ct)
                       ?? throw new AppException("Provider profile not found.", HttpStatusCode.Forbidden);
        if (provider.Status != ProviderStatus.Verified || requirement.Status != RequirementStatus.Open)
        {
            throw new AppException("Requirement is not open.", HttpStatusCode.Forbidden);
        }
    }

    private async Task<(double Average, int Reviews, int Completed, double? ResponseHours)> ReputationAsync(Guid providerUserId, Guid providerProfileId, CancellationToken ct)
    {
        var ratings = await db.Reviews.AsNoTracking()
            .Where(x => x.RevieweeUserId == providerUserId && x.Status == ReviewStatus.Published)
            .Select(x => x.Rating)
            .ToListAsync(ct);
        var completed = await db.Campaigns.CountAsync(x => x.ProviderProfileId == providerProfileId && x.Status == CampaignStatus.Completed, ct);
        var proposals = await db.Proposals.AsNoTracking()
            .Where(x => x.ProviderProfileId == providerProfileId && x.SubmittedAt != null)
            .Select(x => new { x.SubmittedAt, x.Requirement.CreatedAt })
            .Take(20)
            .ToListAsync(ct);
        double? hours = proposals.Count == 0
            ? null
            : proposals.Average(x => (x.SubmittedAt!.Value - x.CreatedAt).TotalHours);
        var average = ratings.Count == 0 ? 0 : ratings.Average();
        return (average, ratings.Count, completed, hours);
    }

    private static string? Badge(double average, int completed)
    {
        if (completed >= 3 && average >= 4.5)
        {
            return "Top Rated";
        }

        if (completed >= 1 && average >= 4)
        {
            return "Rising Talent";
        }

        return null;
    }

    private async Task<PlatformSetting> SettingsAsync(CancellationToken ct)
    {
        var row = await db.PlatformSettings.FirstOrDefaultAsync(ct);
        if (row is not null)
        {
            return row;
        }

        row = new PlatformSetting { Id = Guid.NewGuid() };
        db.PlatformSettings.Add(row);
        await db.SaveChangesAsync(ct);
        return row;
    }

    private static RequirementQuestionDto MapQuestion(RequirementQuestion row)
        => new(row.Id, row.Body, row.Answer, row.CreatedAt, row.AnsweredAt);
}
