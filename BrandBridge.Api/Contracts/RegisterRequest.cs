using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Contracts;

public sealed record RegisterRequest(string Email, string Password, string DisplayName, UserRole Role);
