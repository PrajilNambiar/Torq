using Torq.Api.Domain.Enums;

namespace Torq.Api.Domain.Entities;

public class Milestone
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;
    public int SortOrder { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public DateOnly? DueDate { get; set; }
    public MilestoneStatus Status { get; set; } = MilestoneStatus.Planned;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? ChangeRequestNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<MilestoneDeliverable> Deliverables { get; set; } = new List<MilestoneDeliverable>();
}
