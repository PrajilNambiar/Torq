using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class Proposal
{
    public Guid Id { get; set; }
    public Guid RequirementId { get; set; }
    public Requirement Requirement { get; set; } = null!;
    public Guid ProviderProfileId { get; set; }
    public ProviderProfile ProviderProfile { get; set; } = null!;
    public ProposalStatus Status { get; set; } = ProposalStatus.Draft;
    public PricingModel PricingModel { get; set; } = PricingModel.Fixed;
    public decimal PriceAmount { get; set; }
    public string Currency { get; set; } = "INR";
    public string ScopeOfWork { get; set; } = string.Empty;
    public string Deliverables { get; set; } = string.Empty;
    public int TimelineDays { get; set; }
    public string? TimelineNotes { get; set; }
    public string? ExpectedMetrics { get; set; }
    public int RevisionsIncluded { get; set; }
    public string? ClientRequirements { get; set; }
    public string? OptionalAddOns { get; set; }
    public DateTime? ValidUntil { get; set; }
    public string? CoverNote { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProposalMilestone> Milestones { get; set; } = new List<ProposalMilestone>();
    public ICollection<ProposalPortfolioLink> PortfolioLinks { get; set; } = new List<ProposalPortfolioLink>();
}
