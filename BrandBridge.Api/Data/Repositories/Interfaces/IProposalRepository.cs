using BrandBridge.Api.Domain.Entities;

namespace BrandBridge.Api.Data.Repositories.Interfaces;

public interface IProposalRepository
{
    Task<Proposal?> GetForProviderAsync(Guid requirementId, Guid providerProfileId, CancellationToken ct);
    Task<Proposal?> GetByIdForProviderAsync(Guid proposalId, Guid providerProfileId, CancellationToken ct);
    Task<Proposal?> GetByIdForRequirementAsync(Guid proposalId, Guid requirementId, bool includeMilestones, CancellationToken ct);
    Task<Proposal?> GetOwnedByBusinessAsync(Guid proposalId, Guid requirementId, Guid businessId, CancellationToken ct);
    Task<IReadOnlyList<Proposal>> ListVisibleForRequirementAsync(Guid requirementId, CancellationToken ct);
    Task<IReadOnlyList<Proposal>> ListOthersOnRequirementAsync(Guid requirementId, Guid exceptProposalId, CancellationToken ct);
    void Add(Proposal proposal);
    bool IsUntracked(Proposal proposal);
}
