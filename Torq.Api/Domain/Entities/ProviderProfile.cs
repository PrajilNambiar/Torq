using Torq.Api.Domain.Enums;

namespace Torq.Api.Domain.Entities;

public class ProviderProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public ProviderType ProviderType { get; set; } = ProviderType.Freelancer;
    public string? Headline { get; set; }
    public string? Bio { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string CountryCode { get; set; } = "IN";
    public string Languages { get; set; } = "en";
    public string ServiceCategories { get; set; } = string.Empty;
    public decimal? MinRate { get; set; }
    public decimal? MaxRate { get; set; }
    public string Currency { get; set; } = "INR";
    public string? Availability { get; set; } = "Available";
    public ProviderStatus Status { get; set; } = ProviderStatus.Unverified;
    public bool IdentityVerified { get; set; }
    public bool PortfolioVerified { get; set; }
    public bool SocialVerified { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProviderService> Services { get; set; } = new List<ProviderService>();
    public ICollection<SocialAccount> SocialAccounts { get; set; } = new List<SocialAccount>();
    public ICollection<PortfolioItem> PortfolioItems { get; set; } = new List<PortfolioItem>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
}
