using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record DisputeDto(Guid Id, Guid CampaignId, Guid OpenedByUserId, string Reason, DisputeStatus Status, DateTime CreatedAt);
