using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record AuthResponse(string AccessToken, Guid UserId, UserRole Role, string DisplayName);
