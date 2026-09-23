using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class Campaign
{
    public Guid Id { get; set; }
    public Guid RequirementId { get; set; }
    public Requirement Requirement { get; set; } = null!;
    public Guid ProposalId { get; set; }
    public Proposal Proposal { get; set; } = null!;
    public Guid BusinessId { get; set; }
    public Guid ProviderProfileId { get; set; }
    public CampaignStatus Status { get; set; } = CampaignStatus.PendingFunding;
    public decimal AgreedPrice { get; set; }
    public string Currency { get; set; } = "INR";
    public decimal PlatformFeePercent { get; set; }
    public decimal PlatformFeeAmount { get; set; }
    public string? AgreementSnapshotJson { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
    public MessageThread? Thread { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Payout> Payouts { get; set; } = new List<Payout>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();
}
