using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record MilestoneDto(
    Guid Id,
    int SortOrder,
    string Title,
    decimal Amount,
    MilestoneStatus Status,
    DateOnly? DueDate);
