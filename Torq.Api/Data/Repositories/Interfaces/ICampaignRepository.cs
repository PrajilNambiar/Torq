using Torq.Api.Common;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;

namespace Torq.Api.Data.Repositories.Interfaces;

public interface ICampaignRepository
{
    Task<bool> ExistsForRequirementAsync(Guid requirementId, CancellationToken ct);
    void Add(Campaign campaign);
    Task<PagedResult<Campaign>> ListAsync(Guid? businessId, Guid? providerProfileId, int page, int pageSize, CancellationToken ct);
    Task<Campaign?> GetByIdWithRequirementAsync(Guid id, CancellationToken ct);
    Task<Campaign?> GetWithMilestonesForBusinessAsync(Guid campaignId, Guid businessId, CancellationToken ct);
    Task<IReadOnlyList<Milestone>> ListMilestonesAsync(Guid campaignId, CancellationToken ct);
    Task<Milestone?> GetMilestoneWithCampaignAsync(Guid milestoneId, CancellationToken ct);
    Task<Milestone?> GetMilestoneWithCampaignAndRequirementAsync(Guid milestoneId, CancellationToken ct);
    Task<int> CountUnpaidMilestonesAsync(Guid campaignId, Guid exceptMilestoneId, CancellationToken ct);
    void AddDeliverable(MilestoneDeliverable deliverable);
    void AddPayment(Payment payment);
    void AddPayout(Payout payout);
    Task<MessageThread> GetThreadAsync(Guid campaignId, CancellationToken ct);
    void AddMessage(Message message);
    Task<PagedResult<Message>> ListMessagesAsync(Guid campaignId, int page, int pageSize, CancellationToken ct);
    void AddReview(Review review);
    void AddDispute(Dispute dispute);
    Task<Dispute?> GetDisputeWithCampaignAsync(Guid disputeId, CancellationToken ct);
    void AddDisputeEvidence(DisputeEvidence evidence);
    Task<PagedResult<Dispute>> ListDisputesAsync(int page, int pageSize, CancellationToken ct);
    Task<PagedResult<Campaign>> ListAllAsync(int page, int pageSize, CancellationToken ct);
}
