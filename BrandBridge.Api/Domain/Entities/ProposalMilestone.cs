namespace BrandBridge.Api.Domain.Entities;

public class ProposalMilestone
{
    public Guid Id { get; set; }
    public Guid ProposalId { get; set; }
    public Proposal Proposal { get; set; } = null!;
    public int SortOrder { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public DateOnly? DueDate { get; set; }
}
