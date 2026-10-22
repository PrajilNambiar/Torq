using Torq.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Data;

public class TorqDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public TorqDbContext(DbContextOptions<TorqDbContext> options) : base(options)
    {
    }

    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<ProviderProfile> ProviderProfiles => Set<ProviderProfile>();
    public DbSet<ProviderService> ProviderServices => Set<ProviderService>();
    public DbSet<SocialAccount> SocialAccounts => Set<SocialAccount>();
    public DbSet<PortfolioItem> PortfolioItems => Set<PortfolioItem>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<Requirement> Requirements => Set<Requirement>();
    public DbSet<RequirementAsset> RequirementAssets => Set<RequirementAsset>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<ProposalMilestone> ProposalMilestones => Set<ProposalMilestone>();
    public DbSet<ProposalPortfolioLink> ProposalPortfolioLinks => Set<ProposalPortfolioLink>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<Milestone> Milestones => Set<Milestone>();
    public DbSet<MilestoneDeliverable> MilestoneDeliverables => Set<MilestoneDeliverable>();
    public DbSet<MessageThread> MessageThreads => Set<MessageThread>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageAttachment> MessageAttachments => Set<MessageAttachment>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Payout> Payouts => Set<Payout>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Dispute> Disputes => Set<Dispute>();
    public DbSet<DisputeEvidence> DisputeEvidence => Set<DisputeEvidence>();
    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();
    public DbSet<IdempotencyRecord> IdempotencyRecords => Set<IdempotencyRecord>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Business>(e =>
        {
            e.HasIndex(x => x.OwnerUserId).IsUnique();
            e.HasOne(x => x.Owner).WithOne(x => x.Business).HasForeignKey<Business>(x => x.OwnerUserId);
            e.Property(x => x.LegalName).HasMaxLength(200);
            e.Property(x => x.DisplayName).HasMaxLength(200);
        });

        builder.Entity<ProviderProfile>(e =>
        {
            e.HasIndex(x => x.UserId).IsUnique();
            e.HasIndex(x => new { x.Status, x.CountryCode });
            e.HasOne(x => x.User).WithOne(x => x.ProviderProfile).HasForeignKey<ProviderProfile>(x => x.UserId);
            e.Property(x => x.MinRate).HasPrecision(18, 2);
            e.Property(x => x.MaxRate).HasPrecision(18, 2);
        });

        builder.Entity<ProviderService>(e =>
        {
            e.Property(x => x.StartingPrice).HasPrecision(18, 2);
        });

        builder.Entity<SocialAccount>(e =>
        {
            e.HasIndex(x => new { x.ProviderProfileId, x.Platform, x.Handle }).IsUnique();
        });

        builder.Entity<ServiceCategory>(e =>
        {
            e.HasIndex(x => x.Code).IsUnique();
        });

        builder.Entity<Requirement>(e =>
        {
            e.HasIndex(x => new { x.Status, x.Category, x.Location });
            e.HasIndex(x => new { x.BusinessId, x.CreatedAt });
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.BudgetMin).HasPrecision(18, 2);
            e.Property(x => x.BudgetMax).HasPrecision(18, 2);
        });

        builder.Entity<Proposal>(e =>
        {
            e.HasIndex(x => new { x.RequirementId, x.ProviderProfileId }).IsUnique();
            e.HasIndex(x => new { x.RequirementId, x.Status });
            e.Property(x => x.PriceAmount).HasPrecision(18, 2);
        });

        builder.Entity<ProposalMilestone>(e => e.Property(x => x.Amount).HasPrecision(18, 2));

        builder.Entity<ProposalPortfolioLink>(e =>
        {
            e.HasKey(x => new { x.ProposalId, x.PortfolioItemId });
            e.HasOne(x => x.Proposal).WithMany(x => x.PortfolioLinks).HasForeignKey(x => x.ProposalId);
            e.HasOne(x => x.PortfolioItem).WithMany().HasForeignKey(x => x.PortfolioItemId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Campaign>(e =>
        {
            e.HasIndex(x => x.RequirementId).IsUnique();
            e.HasIndex(x => x.ProposalId).IsUnique();
            e.HasIndex(x => x.BusinessId);
            e.HasIndex(x => x.ProviderProfileId);
            e.Property(x => x.AgreedPrice).HasPrecision(18, 2);
            e.Property(x => x.PlatformFeePercent).HasPrecision(5, 2);
            e.Property(x => x.PlatformFeeAmount).HasPrecision(18, 2);
            e.HasOne(x => x.Requirement).WithOne(x => x.Campaign).HasForeignKey<Campaign>(x => x.RequirementId);
            e.HasOne(x => x.Proposal).WithMany().HasForeignKey(x => x.ProposalId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Milestone>(e => e.Property(x => x.Amount).HasPrecision(18, 2));

        builder.Entity<MessageThread>(e =>
        {
            e.HasIndex(x => x.CampaignId).IsUnique();
            e.HasOne(x => x.Campaign).WithOne(x => x.Thread).HasForeignKey<MessageThread>(x => x.CampaignId);
        });

        builder.Entity<Message>(e => e.HasIndex(x => new { x.ThreadId, x.CreatedAt }));

        builder.Entity<Payment>(e =>
        {
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.HasIndex(x => x.ExternalPaymentId);
        });

        builder.Entity<Payout>(e =>
        {
            e.Property(x => x.GrossAmount).HasPrecision(18, 2);
            e.Property(x => x.FeeAmount).HasPrecision(18, 2);
            e.Property(x => x.NetAmount).HasPrecision(18, 2);
        });

        builder.Entity<Review>(e =>
        {
            e.HasIndex(x => new { x.CampaignId, x.ReviewerUserId }).IsUnique();
        });

        builder.Entity<AuditEvent>(e =>
        {
            e.HasIndex(x => new { x.EntityType, x.EntityId, x.CreatedAt });
        });

        builder.Entity<IdempotencyRecord>(e =>
        {
            e.HasIndex(x => new { x.UserId, x.Key }).IsUnique();
        });

        builder.Entity<ServiceCategory>().HasData(
            new ServiceCategory { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Code = "influencer", Name = "Influencer marketing", IsMvp = true, SortOrder = 1 },
            new ServiceCategory { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Code = "ugc", Name = "UGC / content creation", IsMvp = true, SortOrder = 2 },
            new ServiceCategory { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Code = "smm", Name = "Social media management", IsMvp = true, SortOrder = 3 },
            new ServiceCategory { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Code = "paid-ads", Name = "Paid advertising", IsMvp = true, SortOrder = 4 });
    }
}
