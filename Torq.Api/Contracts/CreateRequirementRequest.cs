namespace Torq.Api.Contracts;

public sealed record CreateRequirementRequest(
    string Title,
    string Category,
    string Goal,
    string? TargetAudience,
    string? Location,
    string Languages,
    string ExpectedDeliverables,
    decimal? BudgetMin,
    decimal? BudgetMax,
    int? TimelineDays,
    string? TimelineNotes,
    string? SelectionPreference,
    DateTime? ProposalDeadlineAt);
