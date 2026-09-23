using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class Business
{
    public Guid Id { get; set; }
    public Guid OwnerUserId { get; set; }
    public ApplicationUser Owner { get; set; } = null!;
    public string LegalName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? HeadquartersCity { get; set; }
    public string? HeadquartersRegion { get; set; }
    public string CountryCode { get; set; } = "IN";
    public string? Gstin { get; set; }
    public string? BillingEmail { get; set; }
    public BusinessStatus Status { get; set; } = BusinessStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Requirement> Requirements { get; set; } = new List<Requirement>();
}
