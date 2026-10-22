namespace Torq.Api.Domain.Entities;

public class PortfolioItem
{
    public Guid Id { get; set; }
    public Guid ProviderProfileId { get; set; }
    public ProviderProfile ProviderProfile { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ClientOrIndustry { get; set; }
    public string? MediaUrl { get; set; }
    public string? MetricsEvidence { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
