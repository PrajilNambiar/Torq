using Torq.Api.Domain.Enums;

namespace Torq.Api.Contracts;

public sealed record RegisterRequest(string Email, string Password, string DisplayName, UserRole Role);
