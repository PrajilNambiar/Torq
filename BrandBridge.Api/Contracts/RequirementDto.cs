using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record RequirementDto(
    Guid Id,
    Guid BusinessId,
    string Title,
    string Category,
    string Goal,
    string? TargetAudience,
    string? Location,
    string Languages,
    string ExpectedDeliverables,
    decimal? BudgetMin,
    decimal? BudgetMax,
    string Currency,
    int? TimelineDays,
    string? TimelineNotes,
    string? SelectionPreference,
    DateTime? ProposalDeadlineAt,
    RequirementStatus Status,
    DateTime CreatedAt,
    IReadOnlyList<FileAssetDto> Assets);
