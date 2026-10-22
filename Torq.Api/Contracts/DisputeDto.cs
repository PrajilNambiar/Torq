using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record DisputeDto(Guid Id, Guid CampaignId, Guid OpenedByUserId, string Reason, DisputeStatus Status, DateTime CreatedAt);
