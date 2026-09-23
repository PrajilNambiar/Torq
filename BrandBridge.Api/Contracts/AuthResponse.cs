using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record AuthResponse(string AccessToken, Guid UserId, UserRole Role, string DisplayName);
