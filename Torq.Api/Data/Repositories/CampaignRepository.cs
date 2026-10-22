using Torq.Api.Common;
using Torq.Api.Data.Repositories.Interfaces;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Data.Repositories;

public sealed class CampaignRepository(TorqDbContext db) : ICampaignRepository
{
    public Task<bool> ExistsForRequirementAsync(Guid requirementId, CancellationToken ct)
        => db.Campaigns.AnyAsync(x => x.RequirementId == requirementId, ct);

    public void Add(Campaign campaign) => db.Campaigns.Add(campaign);

    public async Task<PagedResult<Campaign>> ListAsync(Guid? businessId, Guid? providerProfileId, int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.Campaigns.AsNoTracking().AsQueryable();
        if (businessId is not null)
        {
            query = query.Where(x => x.BusinessId == businessId);
        }
        else if (providerProfileId is not null)
        {
            query = query.Where(x => x.ProviderProfileId == providerProfileId);
        }

        query = query.OrderByDescending(x => x.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<Campaign> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }

    public Task<Campaign?> GetByIdWithRequirementAsync(Guid id, CancellationToken ct)
        => db.Campaigns.Include(x => x.Requirement).FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<Campaign?> GetWithMilestonesForBusinessAsync(Guid campaignId, Guid businessId, CancellationToken ct)
        => db.Campaigns.Include(x => x.Milestones)
            .FirstOrDefaultAsync(x => x.Id == campaignId && x.BusinessId == businessId, ct);

    public async Task<IReadOnlyList<Milestone>> ListMilestonesAsync(Guid campaignId, CancellationToken ct)
        => await db.Milestones.AsNoTracking()
            .Where(x => x.CampaignId == campaignId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

    public Task<Milestone?> GetMilestoneWithCampaignAsync(Guid milestoneId, CancellationToken ct)
        => db.Milestones.Include(x => x.Campaign).FirstOrDefaultAsync(x => x.Id == milestoneId, ct);

    public Task<Milestone?> GetMilestoneWithCampaignAndRequirementAsync(Guid milestoneId, CancellationToken ct)
        => db.Milestones.Include(x => x.Campaign).ThenInclude(x => x.Requirement)
            .FirstOrDefaultAsync(x => x.Id == milestoneId, ct);

    public Task<int> CountUnpaidMilestonesAsync(Guid campaignId, Guid exceptMilestoneId, CancellationToken ct)
        => db.Milestones.CountAsync(
            x => x.CampaignId == campaignId && x.Id != exceptMilestoneId && x.Status != MilestoneStatus.Paid,
            ct);

    public void AddDeliverable(MilestoneDeliverable deliverable) => db.MilestoneDeliverables.Add(deliverable);
    public void AddPayment(Payment payment) => db.Payments.Add(payment);
    public void AddPayout(Payout payout) => db.Payouts.Add(payout);

    public Task<MessageThread> GetThreadAsync(Guid campaignId, CancellationToken ct)
        => db.MessageThreads.FirstAsync(x => x.CampaignId == campaignId, ct);

    public void AddMessage(Message message) => db.Messages.Add(message);

    public async Task<PagedResult<Message>> ListMessagesAsync(Guid campaignId, int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.Messages.AsNoTracking()
            .Include(x => x.Attachments)
            .Where(x => x.Thread.CampaignId == campaignId)
            .OrderBy(x => x.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<Message> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }

    public void AddReview(Review review) => db.Reviews.Add(review);
    public void AddDispute(Dispute dispute) => db.Disputes.Add(dispute);

    public Task<Dispute?> GetDisputeWithCampaignAsync(Guid disputeId, CancellationToken ct)
        => db.Disputes.Include(x => x.Campaign).FirstOrDefaultAsync(x => x.Id == disputeId, ct);

    public void AddDisputeEvidence(DisputeEvidence evidence) => db.DisputeEvidence.Add(evidence);

    public async Task<PagedResult<Dispute>> ListDisputesAsync(int page, int pageSize, CancellationToken ct)
    {
        (page, pageSize) = QueryPaging.Normalize(page, pageSize);
        var query = db.Disputes.AsNoTracking().OrderByDescending(x => x.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedResult<Dispute> { Items = items, Page = page, PageSize = pageSize, Total = total };
    }

    public Task<PagedResult<Campaign>> ListAllAsync(int page, int pageSize, CancellationToken ct)
        => ListAsync(null, null, page, pageSize, ct);
}
