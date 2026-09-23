namespace BrandBridge.Api.Domain.Entities;

public class ProposalPortfolioLink
{
    public Guid ProposalId { get; set; }
    public Proposal Proposal { get; set; } = null!;
    public Guid PortfolioItemId { get; set; }
    public PortfolioItem PortfolioItem { get; set; } = null!;
}
