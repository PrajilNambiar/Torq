using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class Requirement
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public Business Business { get; set; } = null!;
    public Guid CreatedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Goal { get; set; } = string.Empty;
    public string? TargetAudience { get; set; }
    public string? Location { get; set; }
    public string Languages { get; set; } = "en";
    public string ExpectedDeliverables { get; set; } = string.Empty;
    public decimal? BudgetMin { get; set; }
    public decimal? BudgetMax { get; set; }
    public string Currency { get; set; } = "INR";
    public int? TimelineDays { get; set; }
    public string? TimelineNotes { get; set; }
    public string? SelectionPreference { get; set; }
    public DateTime? ProposalDeadlineAt { get; set; }
    public RequirementVisibility Visibility { get; set; } = RequirementVisibility.PublicEligible;
    public RequirementStatus Status { get; set; } = RequirementStatus.Draft;
    public DateTime? PublishedAt { get; set; }
    public Guid? ModeratedByUserId { get; set; }
    public string? ModerationNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RequirementAsset> Assets { get; set; } = new List<RequirementAsset>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public Campaign? Campaign { get; set; }
}
