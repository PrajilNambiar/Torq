using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record OpportunityFilter(string? Location, string? Language, decimal? BudgetMin, decimal? BudgetMax, string? Industry);

public sealed record ProviderCardDto(
    Guid ProviderProfileId,
    string? Headline,
    ProviderStatus Status,
    bool IdentityVerified,
    bool PortfolioVerified,
    bool SocialVerified,
    double AverageRating,
    int ReviewCount,
    int CompletedJobs,
    int PortfolioCount,
    string? Badge,
    double? ResponseHours,
    IReadOnlyList<string> PortfolioTitles);

public sealed record EarningDto(Guid Id, Guid CampaignId, decimal GrossAmount, decimal FeeAmount, decimal NetAmount, string Currency, string Status, DateTime CreatedAt);

public sealed record LedgerEntryDto(string Kind, Guid Id, decimal Amount, string Currency, string Status, string? ExternalId, DateTime CreatedAt);

public sealed record RequirementQuestionDto(Guid Id, string Body, string? Answer, DateTime CreatedAt, DateTime? AnsweredAt);

public sealed record AskQuestionRequest(string Body);

public sealed record AnswerQuestionRequest(string Answer);

public sealed record PayoutAccountRequest(string Label);

public sealed record AuditEventDto(Guid Id, Guid? ActorUserId, string EntityType, Guid EntityId, string Action, DateTime CreatedAt);

public sealed record PlatformSettingsDto(decimal PlatformFeePercent, string AllowedGeographies);

public sealed record UpdatePlatformSettingsRequest(decimal PlatformFeePercent, string AllowedGeographies);

public sealed record PaymentExceptionDto(Guid Id, Guid CampaignId, decimal Amount, string Currency, string Status, DateTime CreatedAt);

public sealed record PrivacyExportDto(string Email, string DisplayName, string Role, string Status, string? Phone, bool FraudFlagged);

public sealed record FraudFlagRequest(bool Flagged);
