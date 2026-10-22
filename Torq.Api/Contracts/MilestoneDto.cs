using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record MilestoneDto(
    Guid Id,
    int SortOrder,
    string Title,
    decimal Amount,
    MilestoneStatus Status,
    DateOnly? DueDate);
