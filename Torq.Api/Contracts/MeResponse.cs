using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record MeResponse(
    Guid UserId,
    string Email,
    string DisplayName,
    UserRole Role,
    UserStatus Status,
    Guid? BusinessId,
    Guid? ProviderProfileId);
