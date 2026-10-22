namespace Torq.Api.Contracts;

public sealed record ProposalMilestoneDto(int SortOrder, string Title, string? Description, decimal Amount, DateOnly? DueDate);
