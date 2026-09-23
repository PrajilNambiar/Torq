using AutoMapper;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Entities;

namespace BrandBridge.Api.Mapping;

public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Business, BusinessDto>().MaxDepth(8);
        CreateMap<UpdateBusinessRequest, Business>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.OwnerUserId, o => o.Ignore())
            .ForMember(d => d.Owner, o => o.Ignore())
            .ForMember(d => d.CountryCode, o => o.Ignore())
            .ForMember(d => d.Status, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore())
            .ForMember(d => d.UpdatedAt, o => o.Ignore())
            .ForMember(d => d.Requirements, o => o.Ignore());

        CreateMap<ProviderProfile, ProviderDto>();
        CreateMap<UpdateProviderRequest, ProviderProfile>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.UserId, o => o.Ignore())
            .ForMember(d => d.User, o => o.Ignore())
            .ForMember(d => d.CountryCode, o => o.Ignore())
            .ForMember(d => d.Currency, o => o.Ignore())
            .ForMember(d => d.Status, o => o.Ignore())
            .ForMember(d => d.IdentityVerified, o => o.Ignore())
            .ForMember(d => d.PortfolioVerified, o => o.Ignore())
            .ForMember(d => d.SocialVerified, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore())
            .ForMember(d => d.UpdatedAt, o => o.Ignore())
            .ForMember(d => d.Services, o => o.Ignore())
            .ForMember(d => d.SocialAccounts, o => o.Ignore())
            .ForMember(d => d.PortfolioItems, o => o.Ignore())
            .ForMember(d => d.Proposals, o => o.Ignore());

        CreateMap<ProviderService, ProviderServiceDto>();
        CreateMap<PortfolioItem, PortfolioItemDto>();
        CreateMap<SocialAccount, SocialAccountDto>();
        CreateMap<Requirement, RequirementDto>()
            .ForCtorParam(nameof(RequirementDto.Assets), o => o.MapFrom(_ => (IReadOnlyList<FileAssetDto>?)null));
        CreateMap<Requirement, OpportunityDto>();
        CreateMap<CreateRequirementRequest, Requirement>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.BusinessId, o => o.Ignore())
            .ForMember(d => d.Business, o => o.Ignore())
            .ForMember(d => d.CreatedByUserId, o => o.Ignore())
            .ForMember(d => d.Currency, o => o.Ignore())
            .ForMember(d => d.Visibility, o => o.Ignore())
            .ForMember(d => d.Status, o => o.Ignore())
            .ForMember(d => d.PublishedAt, o => o.Ignore())
            .ForMember(d => d.ModeratedByUserId, o => o.Ignore())
            .ForMember(d => d.ModerationNotes, o => o.Ignore())
            .ForMember(d => d.CreatedAt, o => o.Ignore())
            .ForMember(d => d.UpdatedAt, o => o.Ignore())
            .ForMember(d => d.Assets, o => o.Ignore())
            .ForMember(d => d.Proposals, o => o.Ignore())
            .ForMember(d => d.Campaign, o => o.Ignore());

        CreateMap<Proposal, ProposalDto>()
            .ForCtorParam(nameof(ProposalDto.ProviderHeadline), o => o.MapFrom(s => s.ProviderProfile != null ? s.ProviderProfile.Headline : null))
            .ForCtorParam(nameof(ProposalDto.PortfolioItemIds), o => o.MapFrom(s => s.PortfolioLinks.Select(l => l.PortfolioItemId).ToList()));

        CreateMap<Campaign, CampaignDto>();
        CreateMap<Milestone, MilestoneDto>();
        CreateMap<Dispute, DisputeDto>();
        CreateMap<MessageAttachment, FileAssetDto>();
        CreateMap<RequirementAsset, FileAssetDto>();
        CreateMap<Message, MessageDto>();
        CreateMap<MilestoneDeliverable, FileAssetDto>()
            .ForCtorParam(nameof(FileAssetDto.ContentType), o => o.MapFrom(s => s.ContentType ?? "application/octet-stream"))
            .ForCtorParam(nameof(FileAssetDto.SizeBytes), o => o.MapFrom(_ => 0L));
        CreateMap<DisputeEvidence, FileAssetDto>()
            .ForCtorParam(nameof(FileAssetDto.ContentType), o => o.MapFrom(_ => "application/octet-stream"))
            .ForCtorParam(nameof(FileAssetDto.SizeBytes), o => o.MapFrom(_ => 0L));
    }
}
