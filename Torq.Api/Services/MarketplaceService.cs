using System.Net;
using System.Text.Json;
using AutoMapper;
using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Data.Repositories.Interfaces;
using Torq.Api.Domain;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;
using Torq.Api.Services.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Torq.Api.Services;

public sealed class MarketplaceService(
    IBusinessRepository businesses,
    IProviderRepository providers,
    IRequirementRepository requirements,
    IProposalRepository proposals,
    ICampaignRepository campaigns,
    IUserRepository users,
    IUnitOfWork unitOfWork,
    IAuditRepository audit,
    IMapper mapper,
    IOptions<MarketplaceOptions> options,
    IFileStorage files,
    IPaymentProvider payments) : IMarketplaceService
{
    public async Task<BusinessDto> GetBusinessAsync(Guid userId, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        return mapper.Map<BusinessDto>(business);
    }

    public async Task<BusinessDto> UpdateBusinessAsync(Guid userId, UpdateBusinessRequest request, CancellationToken ct)
    {
        var business = await businesses.GetByOwnerUserIdAsync(userId, tracking: true, ct)
                       ?? throw new AppException("Business profile not found.", HttpStatusCode.Forbidden);
        mapper.Map(request, business);
        business.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<BusinessDto>(business);
    }

    public async Task<ProviderDto> GetProviderAsync(Guid userId, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        return mapper.Map<ProviderDto>(provider);
    }

    public async Task<ProviderDto> UpdateProviderAsync(Guid userId, UpdateProviderRequest request, CancellationToken ct)
    {
        var provider = await providers.GetByUserIdAsync(userId, tracking: true, ct)
                       ?? throw new AppException("Provider profile not found.", HttpStatusCode.Forbidden);
        mapper.Map(request, provider);
        provider.Status = ProviderStatus.VerificationPending;
        provider.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<ProviderDto>(provider);
    }

    public async Task<ProviderServiceDto> AddServiceAsync(Guid userId, UpsertServiceRequest request, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var entity = new ProviderService
        {
            Id = Guid.NewGuid(),
            ProviderProfileId = provider.Id,
            Category = request.Category,
            Title = request.Title,
            Description = request.Description,
            StartingPrice = request.StartingPrice,
            PricingModel = request.PricingModel,
            TypicalDeliveryDays = request.TypicalDeliveryDays
        };
        providers.AddService(entity);
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<ProviderServiceDto>(entity);
    }

    public async Task<IReadOnlyList<ProviderServiceDto>> ListServicesAsync(Guid userId, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var rows = await providers.ListServicesAsync(provider.Id, ct);
        return mapper.Map<List<ProviderServiceDto>>(rows);
    }

    public async Task<PortfolioItemDto> AddPortfolioAsync(Guid userId, CreatePortfolioRequest request, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var item = new PortfolioItem
        {
            Id = Guid.NewGuid(),
            ProviderProfileId = provider.Id,
            Title = request.Title,
            Description = request.Description,
            ClientOrIndustry = request.ClientOrIndustry,
            MediaUrl = request.MediaUrl,
            MetricsEvidence = request.MetricsEvidence
        };
        providers.AddPortfolio(item);
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<PortfolioItemDto>(item);
    }

    public async Task<IReadOnlyList<PortfolioItemDto>> ListPortfolioAsync(Guid userId, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var rows = await providers.ListPortfolioAsync(provider.Id, ct);
        return mapper.Map<List<PortfolioItemDto>>(rows);
    }

    public async Task<SocialAccountDto> AddSocialAsync(Guid userId, CreateSocialRequest request, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var account = new SocialAccount
        {
            Id = Guid.NewGuid(),
            ProviderProfileId = provider.Id,
            Platform = request.Platform,
            Handle = request.Handle,
            ProfileUrl = request.ProfileUrl,
            FollowerCount = request.FollowerCount
        };
        providers.AddSocial(account);
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<SocialAccountDto>(account);
    }

    public async Task<IReadOnlyList<SocialAccountDto>> ListSocialAsync(Guid userId, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var rows = await providers.ListSocialAsync(provider.Id, ct);
        return mapper.Map<List<SocialAccountDto>>(rows);
    }

    public async Task<FileAssetDto> AttachRequirementAssetAsync(Guid userId, Guid requirementId, AttachFileRequest request, CancellationToken ct)
    {
        EnsureStored(request.StorageKey);
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var requirement = await requirements.GetByIdAndBusinessAsync(requirementId, business.Id, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        var asset = new RequirementAsset
        {
            Id = Guid.NewGuid(),
            RequirementId = requirement.Id,
            FileName = request.FileName,
            ContentType = request.ContentType,
            StorageKey = request.StorageKey,
            SizeBytes = request.SizeBytes
        };
        requirements.AddAsset(asset);
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<FileAssetDto>(asset);
    }

    public async Task<RequirementDto> CreateRequirementAsync(Guid userId, CreateRequirementRequest request, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var requirement = mapper.Map<Requirement>(request);
        requirement.Id = Guid.NewGuid();
        requirement.BusinessId = business.Id;
        requirement.CreatedByUserId = userId;
        requirements.Add(requirement);
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Requirement", requirement.Id, "Created", cancellationToken: ct);
        return mapper.Map<RequirementDto>(requirement);
    }

    public async Task<RequirementDto> UpdateRequirementAsync(Guid userId, Guid id, CreateRequirementRequest request, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var requirement = await requirements.GetByIdAndBusinessAsync(id, business.Id, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        if (requirement.Status != RequirementStatus.Draft)
        {
            throw new AppException("Only draft requirements can be edited.");
        }

        mapper.Map(request, requirement);
        requirement.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<RequirementDto>(requirement);
    }

    public async Task SubmitRequirementAsync(Guid userId, Guid id, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var requirement = await requirements.GetByIdAndBusinessAsync(id, business.Id, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        if (requirement.Status != RequirementStatus.Draft)
        {
            throw new AppException("Requirement is not in draft.");
        }

        requirement.Status = RequirementStatus.UnderReview;
        requirement.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Requirement", requirement.Id, "Submitted", cancellationToken: ct);
    }

    public async Task<PagedResult<RequirementDto>> ListMyRequirementsAsync(Guid userId, int page, int pageSize, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var result = await requirements.ListByBusinessAsync(business.Id, page, pageSize, ct);
        return MapPage<Requirement, RequirementDto>(result);
    }

    public async Task<RequirementDto> GetRequirementAsync(Guid userId, UserRole role, Guid id, CancellationToken ct)
    {
        var requirement = await requirements.GetByIdAsync(id, tracking: false, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);

        if (role == UserRole.Business)
        {
            var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
            if (requirement.BusinessId != business.Id)
            {
                throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
            }
        }
        else if (role == UserRole.Provider)
        {
            var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
            if (!RequirementMatcher.IsEligible(requirement, provider.ServiceCategories))
            {
                throw new AppException("Requirement is not open.", HttpStatusCode.Forbidden);
            }
        }

        return mapper.Map<RequirementDto>(requirement);
    }

    public async Task<PagedResult<OpportunityDto>> ListOpportunitiesAsync(Guid userId, int page, int pageSize, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        EnsureVerified(provider);

        var categories = RequirementMatcher.ParseServiceCategories(provider.ServiceCategories);
        var result = await requirements.ListEligibleAsync(categories, page, pageSize, ct);
        return MapPage<Requirement, OpportunityDto>(result);
    }

    public async Task<ProposalDto> UpsertProposalAsync(Guid userId, UpsertProposalRequest request, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        EnsureVerified(provider);
        var requirement = await requirements.GetByIdAsync(request.RequirementId, tracking: true, ct)
                          ?? throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        if (!RequirementMatcher.IsEligible(requirement, provider.ServiceCategories))
        {
            throw new AppException("Requirement is not accepting proposals.");
        }

        var proposal = await proposals.GetForProviderAsync(request.RequirementId, provider.Id, ct);
        if (proposal is { Status: ProposalStatus.Withdrawn or ProposalStatus.Rejected or ProposalStatus.Accepted })
        {
            throw new AppException("This proposal can no longer be edited.");
        }

        proposal ??= new Proposal
        {
            Id = Guid.NewGuid(),
            RequirementId = requirement.Id,
            ProviderProfileId = provider.Id
        };

        proposal.PricingModel = request.PricingModel;
        proposal.PriceAmount = request.PriceAmount;
        proposal.ScopeOfWork = request.ScopeOfWork;
        proposal.Deliverables = request.Deliverables;
        proposal.TimelineDays = request.TimelineDays;
        proposal.TimelineNotes = request.TimelineNotes;
        proposal.ExpectedMetrics = request.ExpectedMetrics;
        proposal.RevisionsIncluded = request.RevisionsIncluded;
        proposal.ClientRequirements = request.ClientRequirements;
        proposal.OptionalAddOns = request.OptionalAddOns;
        proposal.CoverNote = request.CoverNote;
        proposal.UpdatedAt = DateTime.UtcNow;
        proposal.Milestones.Clear();
        foreach (var milestone in request.Milestones ?? [])
        {
            proposal.Milestones.Add(new ProposalMilestone
            {
                Id = Guid.NewGuid(),
                SortOrder = milestone.SortOrder,
                Title = milestone.Title,
                Description = milestone.Description,
                Amount = milestone.Amount,
                DueDate = milestone.DueDate
            });
        }

        proposal.PortfolioLinks.Clear();
        foreach (var portfolioId in request.PortfolioItemIds ?? [])
        {
            if (!await providers.OwnsPortfolioItemAsync(provider.Id, portfolioId, ct))
            {
                throw new AppException("Portfolio item not found.");
            }

            proposal.PortfolioLinks.Add(new ProposalPortfolioLink { PortfolioItemId = portfolioId });
        }

        if (request.Submit)
        {
            proposal.Status = ProposalStatus.Submitted;
            proposal.SubmittedAt = DateTime.UtcNow;
            if (requirement.Status == RequirementStatus.Open)
            {
                requirement.Status = RequirementStatus.ProposalReview;
            }
        }
        else
        {
            proposal.Status = ProposalStatus.Draft;
        }

        if (proposals.IsUntracked(proposal))
        {
            proposals.Add(proposal);
        }

        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Proposal", proposal.Id, request.Submit ? "Submitted" : "Saved", cancellationToken: ct);
        return mapper.Map<ProposalDto>(proposal) with { ProviderHeadline = provider.Headline };
    }

    public async Task WithdrawProposalAsync(Guid userId, Guid proposalId, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var proposal = await proposals.GetByIdForProviderAsync(proposalId, provider.Id, ct)
                       ?? throw new AppException("Proposal not found.", HttpStatusCode.NotFound);
        if (proposal.Status is ProposalStatus.Accepted)
        {
            throw new AppException("Accepted proposals cannot be withdrawn.");
        }

        proposal.Status = ProposalStatus.Withdrawn;
        proposal.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Proposal", proposal.Id, "Withdrawn", cancellationToken: ct);
    }

    public async Task<IReadOnlyList<ProposalDto>> ListProposalsForRequirementAsync(Guid userId, Guid requirementId, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        if (!await requirements.ExistsForBusinessAsync(requirementId, business.Id, ct))
        {
            throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        }

        var rows = await proposals.ListVisibleForRequirementAsync(requirementId, ct);
        return mapper.Map<List<ProposalDto>>(rows);
    }

    public async Task ShortlistAsync(Guid userId, Guid requirementId, Guid proposalId, CancellationToken ct)
    {
        var proposal = await LoadOwnedProposalAsync(userId, requirementId, proposalId, ct);
        proposal.Status = ProposalStatus.Shortlisted;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Proposal", proposal.Id, "Shortlisted", cancellationToken: ct);
    }

    public async Task<CampaignDto> SelectProposalAsync(Guid userId, Guid requirementId, Guid proposalId, CancellationToken ct)
    {
        var proposal = await proposals.GetByIdForRequirementAsync(proposalId, requirementId, includeMilestones: true, ct)
            ?? throw new AppException("Proposal not found.", HttpStatusCode.NotFound);

        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        if (proposal.Requirement.BusinessId != business.Id)
        {
            throw new AppException("Requirement not found.", HttpStatusCode.NotFound);
        }

        if (await campaigns.ExistsForRequirementAsync(requirementId, ct))
        {
            throw new AppException("A provider has already been selected.");
        }

        if (proposal.Status is not (ProposalStatus.Submitted or ProposalStatus.Shortlisted))
        {
            throw new AppException("Proposal cannot be selected.");
        }

        var feePercent = options.Value.PlatformFeePercent;
        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            RequirementId = requirementId,
            ProposalId = proposal.Id,
            BusinessId = business.Id,
            ProviderProfileId = proposal.ProviderProfileId,
            Status = CampaignStatus.PendingFunding,
            AgreedPrice = proposal.PriceAmount,
            Currency = proposal.Currency,
            PlatformFeePercent = feePercent,
            PlatformFeeAmount = Math.Round(proposal.PriceAmount * feePercent / 100m, 2),
            AgreementSnapshotJson = JsonSerializer.Serialize(new
            {
                proposal.ScopeOfWork,
                proposal.Deliverables,
                proposal.PriceAmount,
                proposal.TimelineDays
            })
        };

        var milestones = proposal.Milestones.OrderBy(x => x.SortOrder).ToList();
        if (milestones.Count == 0)
        {
            campaign.Milestones.Add(new Milestone
            {
                Id = Guid.NewGuid(),
                SortOrder = 1,
                Title = "Delivery",
                Amount = proposal.PriceAmount,
                Status = MilestoneStatus.Planned
            });
        }
        else
        {
            foreach (var item in milestones)
            {
                campaign.Milestones.Add(new Milestone
                {
                    Id = Guid.NewGuid(),
                    SortOrder = item.SortOrder,
                    Title = item.Title,
                    Description = item.Description,
                    Amount = item.Amount,
                    DueDate = item.DueDate,
                    Status = MilestoneStatus.Planned
                });
            }
        }

        campaign.Thread = new MessageThread { Id = Guid.NewGuid() };
        proposal.Status = ProposalStatus.Accepted;
        proposal.Requirement.Status = RequirementStatus.ProviderSelected;
        var others = await proposals.ListOthersOnRequirementAsync(requirementId, proposal.Id, ct);
        foreach (var other in others)
        {
            other.Status = ProposalStatus.Rejected;
        }

        campaigns.Add(campaign);
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Campaign", campaign.Id, "ProviderSelected", cancellationToken: ct);
        return mapper.Map<CampaignDto>(campaign);
    }

    public async Task<PagedResult<CampaignDto>> ListCampaignsAsync(Guid userId, UserRole role, int page, int pageSize, CancellationToken ct)
    {
        Guid? businessId = null;
        Guid? providerId = null;
        if (role == UserRole.Business)
        {
            businessId = (await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct)).Id;
        }
        else if (role == UserRole.Provider)
        {
            providerId = (await providers.RequireByUserIdAsync(userId, tracking: false, ct)).Id;
        }

        var result = await campaigns.ListAsync(businessId, providerId, page, pageSize, ct);
        return MapPage<Campaign, CampaignDto>(result);
    }

    public async Task<CampaignDto> GetCampaignAsync(Guid userId, UserRole role, Guid id, CancellationToken ct)
    {
        var campaign = await RequireCampaignAccessAsync(userId, role, id, ct);
        return mapper.Map<CampaignDto>(campaign);
    }

    public async Task<IReadOnlyList<MilestoneDto>> ListMilestonesAsync(Guid userId, UserRole role, Guid campaignId, CancellationToken ct)
    {
        await RequireCampaignAccessAsync(userId, role, campaignId, ct);
        var rows = await campaigns.ListMilestonesAsync(campaignId, ct);
        return mapper.Map<List<MilestoneDto>>(rows);
    }

    public async Task SubmitMilestoneAsync(Guid userId, Guid milestoneId, SubmitMilestoneRequest? request, CancellationToken ct)
    {
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var milestone = await campaigns.GetMilestoneWithCampaignAsync(milestoneId, ct)
                        ?? throw new AppException("Milestone not found.", HttpStatusCode.NotFound);
        if (milestone.Campaign.ProviderProfileId != provider.Id)
        {
            throw new AppException("Milestone not found.", HttpStatusCode.NotFound);
        }

        if (milestone.Campaign.Status != CampaignStatus.Active)
        {
            throw new AppException("Campaign is not active.");
        }

        foreach (var file in request?.Deliverables ?? [])
        {
            EnsureStored(file.StorageKey);
            campaigns.AddDeliverable(new MilestoneDeliverable
            {
                Id = Guid.NewGuid(),
                MilestoneId = milestone.Id,
                FileName = file.FileName,
                StorageKey = file.StorageKey,
                ContentType = file.ContentType,
                ExternalUrl = file.ExternalUrl
            });
        }

        milestone.Status = MilestoneStatus.Submitted;
        milestone.SubmittedAt = DateTime.UtcNow;
        milestone.Campaign.Status = CampaignStatus.AwaitingApproval;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Milestone", milestone.Id, "Submitted", cancellationToken: ct);
    }

    public async Task RequestChangesAsync(Guid userId, Guid milestoneId, string notes, CancellationToken ct)
    {
        var milestone = await LoadBusinessMilestoneAsync(userId, milestoneId, ct);
        milestone.Status = MilestoneStatus.ChangesRequested;
        milestone.ChangeRequestNotes = notes;
        milestone.Campaign.Status = CampaignStatus.Active;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Milestone", milestone.Id, "ChangesRequested", cancellationToken: ct);
    }

    public async Task ApproveMilestoneAsync(Guid userId, Guid milestoneId, CancellationToken ct)
    {
        var milestone = await LoadBusinessMilestoneAsync(userId, milestoneId, ct);
        milestone.Status = MilestoneStatus.Approved;
        milestone.ApprovedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Milestone", milestone.Id, "Approved", cancellationToken: ct);
    }

    public async Task FundCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var campaign = await campaigns.GetWithMilestonesForBusinessAsync(campaignId, business.Id, ct)
                       ?? throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
        if (campaign.Status != CampaignStatus.PendingFunding)
        {
            throw new AppException("Campaign is not awaiting funding.");
        }

        if (await campaigns.HasInFlightPaymentAsync(campaign.Id, ct))
        {
            throw new AppException("A payment for this campaign is already in progress.", HttpStatusCode.Conflict);
        }

        if (campaign.Milestones.Sum(x => x.Amount) != campaign.AgreedPrice)
        {
            throw new AppException("Milestone amounts must equal the agreed price.");
        }

        var result = payments.Charge(campaign.AgreedPrice, campaign.Currency, campaign.Id.ToString());
        var status = ToPaymentStatus(result.Outcome);
        campaigns.AddPayment(new Payment
        {
            Id = Guid.NewGuid(),
            CampaignId = campaign.Id,
            Amount = campaign.AgreedPrice,
            Currency = campaign.Currency,
            Status = status,
            ExternalProvider = result.Provider,
            ExternalPaymentId = result.ExternalId,
            PaidAt = status == PaymentStatus.Succeeded ? DateTime.UtcNow : null
        });

        if (status == PaymentStatus.Succeeded)
        {
            campaign.Status = CampaignStatus.Active;
            campaign.StartedAt = DateTime.UtcNow;
            foreach (var milestone in campaign.Milestones)
            {
                milestone.Status = MilestoneStatus.Funded;
            }
        }

        try
        {
            await unitOfWork.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            throw new AppException("A payment for this campaign is already in progress.", HttpStatusCode.Conflict);
        }

        var action = status switch
        {
            PaymentStatus.Succeeded => "Funded",
            PaymentStatus.Failed => "FundingFailed",
            _ => "FundingPending"
        };
        await audit.WriteAsync(userId, "Campaign", campaign.Id, action, cancellationToken: ct);
        if (status == PaymentStatus.Failed)
        {
            throw new AppException("Payment was declined.", HttpStatusCode.PaymentRequired);
        }
    }

    public async Task RefundCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var campaign = await campaigns.GetWithMilestonesForBusinessAsync(campaignId, business.Id, ct)
                       ?? throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
        var payment = await campaigns.FindLatestPaymentAsync(campaign.Id, PaymentStatus.Succeeded, ct)
                      ?? throw new AppException("There is no captured payment to refund.", HttpStatusCode.Conflict);
        if (await campaigns.HasCommittedPayoutAsync(campaign.Id, ct))
        {
            throw new AppException("Payouts have already started, so this payment cannot be refunded.", HttpStatusCode.Conflict);
        }

        if (string.IsNullOrWhiteSpace(payment.ExternalPaymentId))
        {
            throw new AppException("Payment has no provider reference.", HttpStatusCode.Conflict);
        }

        var result = payments.Refund(payment.ExternalPaymentId, payment.Amount, payment.Currency);
        if (result.Outcome == ProviderOutcome.Failed)
        {
            await audit.WriteAsync(userId, "Campaign", campaign.Id, "RefundFailed", cancellationToken: ct);
            throw new AppException("Refund was declined.", HttpStatusCode.PaymentRequired);
        }

        if (result.Outcome != ProviderOutcome.Succeeded)
        {
            return;
        }

        payment.Status = PaymentStatus.Refunded;
        campaign.Status = CampaignStatus.Cancelled;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Campaign", campaign.Id, "Refunded", cancellationToken: ct);
    }

    public async Task CancelFundingAsync(Guid userId, Guid campaignId, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var campaign = await campaigns.GetWithMilestonesForBusinessAsync(campaignId, business.Id, ct)
                       ?? throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
        if (campaign.Status != CampaignStatus.PendingFunding)
        {
            throw new AppException("Only a payment that is still processing can be cancelled.", HttpStatusCode.Conflict);
        }

        var payment = await campaigns.FindLatestPaymentAsync(campaign.Id, PaymentStatus.Processing, ct)
                      ?? throw new AppException("There is no processing payment to cancel.", HttpStatusCode.Conflict);
        if (string.IsNullOrWhiteSpace(payment.ExternalPaymentId))
        {
            throw new AppException("Payment has no provider reference.", HttpStatusCode.Conflict);
        }

        var result = payments.Cancel(payment.ExternalPaymentId);
        if (result.Outcome == ProviderOutcome.Failed)
        {
            throw new AppException("Cancellation was declined.", HttpStatusCode.PaymentRequired);
        }

        if (result.Outcome != ProviderOutcome.Succeeded)
        {
            return;
        }

        payment.Status = PaymentStatus.Cancelled;
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Campaign", campaign.Id, "FundingCancelled", cancellationToken: ct);
    }

    public async Task PayoutMilestoneAsync(Guid userId, Guid milestoneId, CancellationToken ct)
    {
        var milestone = await LoadBusinessMilestoneAsync(userId, milestoneId, ct);
        if (milestone.Status != MilestoneStatus.Approved)
        {
            throw new AppException("Milestone must be approved before payout.");
        }

        if (await campaigns.HasInFlightPayoutAsync(milestone.Id, ct))
        {
            throw new AppException("A payout for this milestone is already in progress.", HttpStatusCode.Conflict);
        }

        var captured = await campaigns.SumCapturedAsync(milestone.CampaignId, ct);
        var committed = await campaigns.SumCommittedPayoutGrossAsync(milestone.CampaignId, ct);
        if (milestone.Amount <= 0 || committed + milestone.Amount > captured)
        {
            throw new AppException("Payout would exceed the captured amount.");
        }

        var fee = Math.Round(milestone.Amount * milestone.Campaign.PlatformFeePercent / 100m, 2);
        var net = milestone.Amount - fee;
        if (net + fee != milestone.Amount)
        {
            throw new AppException("Payout fee does not match the milestone amount.");
        }
        var result = payments.SendPayout(net, milestone.Campaign.Currency, milestone.Id.ToString());
        var status = ToPayoutStatus(result.Outcome);
        var now = DateTime.UtcNow;
        campaigns.AddPayout(new Payout
        {
            Id = Guid.NewGuid(),
            CampaignId = milestone.CampaignId,
            MilestoneId = milestone.Id,
            ProviderProfileId = milestone.Campaign.ProviderProfileId,
            GrossAmount = milestone.Amount,
            FeeAmount = fee,
            NetAmount = net,
            Currency = milestone.Campaign.Currency,
            Status = status,
            ExternalPayoutId = result.ExternalId,
            PaidAt = status == PayoutStatus.Paid ? now : null
        });
        if (status == PayoutStatus.Paid)
        {
            milestone.Status = MilestoneStatus.Paid;
            milestone.PaidAt = now;
            var remaining = await campaigns.CountUnpaidMilestonesAsync(milestone.CampaignId, milestone.Id, ct);
            if (remaining == 0)
            {
                milestone.Campaign.Status = CampaignStatus.Completed;
                milestone.Campaign.CompletedAt = now;
                milestone.Campaign.Requirement.Status = RequirementStatus.Closed;
            }
            else
            {
                milestone.Campaign.Status = CampaignStatus.Active;
            }
        }

        try
        {
            await unitOfWork.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            throw new AppException("A payout for this milestone is already in progress.", HttpStatusCode.Conflict);
        }

        var action = status switch
        {
            PayoutStatus.Paid => "Paid",
            PayoutStatus.Failed => "PayoutFailed",
            _ => "PayoutPending"
        };
        await audit.WriteAsync(userId, "Milestone", milestone.Id, action, cancellationToken: ct);
        if (status == PayoutStatus.Failed)
        {
            throw new AppException("Payout was declined.", HttpStatusCode.PaymentRequired);
        }
    }

    public async Task<MessageDto> PostMessageAsync(Guid userId, Guid campaignId, CreateMessageRequest request, CancellationToken ct)
    {
        ContactLeakGuard.EnsureClean(request.Body);
        var role = await users.GetRoleAsync(userId, ct);
        var campaign = await RequireCampaignAccessAsync(userId, role, campaignId, ct);
        var thread = await campaigns.GetThreadAsync(campaign.Id, ct);
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ThreadId = thread.Id,
            SenderUserId = userId,
            Body = request.Body
        };
        foreach (var file in request.Attachments ?? [])
        {
            EnsureStored(file.StorageKey);
            message.Attachments.Add(new MessageAttachment
            {
                Id = Guid.NewGuid(),
                FileName = file.FileName,
                StorageKey = file.StorageKey,
                ContentType = file.ContentType,
                SizeBytes = file.SizeBytes
            });
        }

        campaigns.AddMessage(message);
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<MessageDto>(message);
    }

    public async Task<PagedResult<MessageDto>> ListMessagesAsync(Guid userId, UserRole role, Guid campaignId, int page, int pageSize, CancellationToken ct)
    {
        await RequireCampaignAccessAsync(userId, role, campaignId, ct);
        var result = await campaigns.ListMessagesAsync(campaignId, page, pageSize, ct);
        return MapPage<Message, MessageDto>(result);
    }

    public async Task AddReviewAsync(Guid userId, Guid campaignId, CreateReviewRequest request, CancellationToken ct)
    {
        if (request.Rating is < 1 or > 5)
        {
            throw new AppException("Rating must be between 1 and 5.");
        }

        var role = await users.GetRoleAsync(userId, ct);
        var campaign = await campaigns.GetByIdWithRequirementAsync(campaignId, ct)
                       ?? throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
        await RequireCampaignAccessAsync(userId, role, campaignId, ct);
        if (campaign.Status != CampaignStatus.Completed)
        {
            throw new AppException("Reviews are available after completion.");
        }

        var providerUserId = await providers.GetUserIdAsync(campaign.ProviderProfileId, ct);
        var reviewee = role == UserRole.Business ? providerUserId : campaign.Requirement.CreatedByUserId;

        campaigns.AddReview(new Review
        {
            Id = Guid.NewGuid(),
            CampaignId = campaign.Id,
            ReviewerUserId = userId,
            RevieweeUserId = reviewee,
            Rating = request.Rating,
            Comment = request.Comment
        });
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Review", campaign.Id, "Submitted", cancellationToken: ct);
    }

    public async Task<DisputeDto> OpenDisputeAsync(Guid userId, Guid campaignId, CreateDisputeRequest request, CancellationToken ct)
    {
        ContactLeakGuard.EnsureClean(request.Reason);
        var role = await users.GetRoleAsync(userId, ct);
        var campaign = await RequireCampaignAccessAsync(userId, role, campaignId, ct);
        campaign.Status = CampaignStatus.Disputed;
        var dispute = new Dispute
        {
            Id = Guid.NewGuid(),
            CampaignId = campaign.Id,
            OpenedByUserId = userId,
            Reason = request.Reason
        };
        foreach (var file in request.Evidence ?? [])
        {
            EnsureStored(file.StorageKey);
            dispute.Evidence.Add(new DisputeEvidence
            {
                Id = Guid.NewGuid(),
                UploadedByUserId = userId,
                StorageKey = file.StorageKey,
                FileName = file.FileName
            });
        }

        campaigns.AddDispute(dispute);
        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(userId, "Dispute", campaign.Id, "Opened", cancellationToken: ct);
        return mapper.Map<DisputeDto>(dispute);
    }

    public async Task<FileAssetDto> AttachMilestoneDeliverableAsync(Guid userId, Guid milestoneId, AttachFileRequest request, CancellationToken ct)
    {
        EnsureStored(request.StorageKey);
        var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
        var milestone = await campaigns.GetMilestoneWithCampaignAsync(milestoneId, ct)
                        ?? throw new AppException("Milestone not found.", HttpStatusCode.NotFound);
        if (milestone.Campaign.ProviderProfileId != provider.Id)
        {
            throw new AppException("Milestone not found.", HttpStatusCode.NotFound);
        }

        var deliverable = new MilestoneDeliverable
        {
            Id = Guid.NewGuid(),
            MilestoneId = milestone.Id,
            FileName = request.FileName,
            StorageKey = request.StorageKey,
            ContentType = request.ContentType,
            ExternalUrl = request.ExternalUrl
        };
        campaigns.AddDeliverable(deliverable);
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<FileAssetDto>(deliverable);
    }

    public async Task<FileAssetDto> AttachDisputeEvidenceAsync(Guid userId, Guid disputeId, AttachFileRequest request, CancellationToken ct)
    {
        EnsureStored(request.StorageKey);
        var role = await users.GetRoleAsync(userId, ct);
        var dispute = await campaigns.GetDisputeWithCampaignAsync(disputeId, ct)
                      ?? throw new AppException("Dispute not found.", HttpStatusCode.NotFound);
        await RequireCampaignAccessAsync(userId, role, dispute.CampaignId, ct);
        var evidence = new DisputeEvidence
        {
            Id = Guid.NewGuid(),
            DisputeId = dispute.Id,
            UploadedByUserId = userId,
            StorageKey = request.StorageKey,
            FileName = request.FileName
        };
        campaigns.AddDisputeEvidence(evidence);
        await unitOfWork.SaveChangesAsync(ct);
        return new FileAssetDto(evidence.Id, evidence.FileName, evidence.StorageKey, request.ContentType, request.SizeBytes);
    }

    private async Task<Proposal> LoadOwnedProposalAsync(Guid userId, Guid requirementId, Guid proposalId, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        return await proposals.GetOwnedByBusinessAsync(proposalId, requirementId, business.Id, ct)
               ?? throw new AppException("Proposal not found.", HttpStatusCode.NotFound);
    }

    private async Task<Campaign> RequireCampaignAccessAsync(Guid userId, UserRole role, Guid campaignId, CancellationToken ct)
    {
        var campaign = await campaigns.GetByIdWithRequirementAsync(campaignId, ct)
                       ?? throw new AppException("Campaign not found.", HttpStatusCode.NotFound);

        if (role == UserRole.Admin)
        {
            return campaign;
        }

        if (role == UserRole.Business)
        {
            var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
            if (campaign.BusinessId != business.Id)
            {
                throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
            }
        }
        else if (role == UserRole.Provider)
        {
            var provider = await providers.RequireByUserIdAsync(userId, tracking: false, ct);
            if (campaign.ProviderProfileId != provider.Id)
            {
                throw new AppException("Campaign not found.", HttpStatusCode.NotFound);
            }
        }

        return campaign;
    }

    private async Task<Milestone> LoadBusinessMilestoneAsync(Guid userId, Guid milestoneId, CancellationToken ct)
    {
        var business = await businesses.RequireByOwnerUserIdAsync(userId, tracking: false, ct);
        var milestone = await campaigns.GetMilestoneWithCampaignAndRequirementAsync(milestoneId, ct)
            ?? throw new AppException("Milestone not found.", HttpStatusCode.NotFound);
        if (milestone.Campaign.BusinessId != business.Id)
        {
            throw new AppException("Milestone not found.", HttpStatusCode.NotFound);
        }

        return milestone;
    }

    private void EnsureStored(string storageKey)
    {
        if (!files.Exists(storageKey))
        {
            throw new AppException("Uploaded file was not found. Upload via /api/v1/files first.");
        }
    }

    private static PaymentStatus ToPaymentStatus(ProviderOutcome outcome) => outcome switch
    {
        ProviderOutcome.Succeeded => PaymentStatus.Succeeded,
        ProviderOutcome.Failed => PaymentStatus.Failed,
        _ => PaymentStatus.Processing
    };

    private static PayoutStatus ToPayoutStatus(ProviderOutcome outcome) => outcome switch
    {
        ProviderOutcome.Succeeded => PayoutStatus.Paid,
        ProviderOutcome.Failed => PayoutStatus.Failed,
        _ => PayoutStatus.Processing
    };

    private static void EnsureVerified(ProviderProfile provider)
    {
        if (provider.Status != ProviderStatus.Verified)
        {
            throw new AppException("Only verified providers can access opportunities and submit proposals.", HttpStatusCode.Forbidden);
        }
    }

    private PagedResult<TDto> MapPage<TEntity, TDto>(PagedResult<TEntity> page)
        => new()
        {
            Items = mapper.Map<List<TDto>>(page.Items),
            Page = page.Page,
            PageSize = page.PageSize,
            Total = page.Total
        };
}
