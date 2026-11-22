namespace Torq.Api.Contracts;

public sealed record LoginRequest(string Email, string Password, string? Code = null);
