using Torq.Api.Data.Repositories.Interfaces;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Data.Repositories;

public sealed class ProposalRepository(TorqDbContext db) : IProposalRepository
{
    public Task<Proposal?> GetForProviderAsync(Guid requirementId, Guid providerProfileId, CancellationToken ct)
        => db.Proposals
            .Include(x => x.Milestones)
            .Include(x => x.PortfolioLinks)
            .FirstOrDefaultAsync(x => x.RequirementId == requirementId && x.ProviderProfileId == providerProfileId, ct);

    public Task<Proposal?> GetByIdForProviderAsync(Guid proposalId, Guid providerProfileId, CancellationToken ct)
        => db.Proposals.FirstOrDefaultAsync(x => x.Id == proposalId && x.ProviderProfileId == providerProfileId, ct);

    public async Task<Proposal?> GetByIdForRequirementAsync(Guid proposalId, Guid requirementId, bool includeMilestones, CancellationToken ct)
    {
        var query = db.Proposals.Include(x => x.Requirement).AsQueryable();
        if (includeMilestones)
        {
            query = query.Include(x => x.Milestones);
        }

        return await query.FirstOrDefaultAsync(x => x.Id == proposalId && x.RequirementId == requirementId, ct);
    }

    public Task<Proposal?> GetOwnedByBusinessAsync(Guid proposalId, Guid requirementId, Guid businessId, CancellationToken ct)
        => db.Proposals.Include(x => x.Requirement)
            .FirstOrDefaultAsync(x => x.Id == proposalId && x.RequirementId == requirementId && x.Requirement.BusinessId == businessId, ct);

    public async Task<IReadOnlyList<Proposal>> ListVisibleForRequirementAsync(Guid requirementId, CancellationToken ct)
        => await db.Proposals.AsNoTracking()
            .Include(x => x.ProviderProfile)
            .Include(x => x.PortfolioLinks)
            .Where(x => x.RequirementId == requirementId && x.Status != ProposalStatus.Draft && x.Status != ProposalStatus.Withdrawn)
            .OrderByDescending(x => x.SubmittedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Proposal>> ListOthersOnRequirementAsync(Guid requirementId, Guid exceptProposalId, CancellationToken ct)
        => await db.Proposals
            .Where(x => x.RequirementId == requirementId && x.Id != exceptProposalId && x.Status != ProposalStatus.Withdrawn)
            .ToListAsync(ct);

    public void Add(Proposal proposal) => db.Proposals.Add(proposal);

    public bool IsUntracked(Proposal proposal) => db.Entry(proposal).State == EntityState.Detached;
}
