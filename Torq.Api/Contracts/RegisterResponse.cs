namespace Torq.Api.Contracts;

public sealed record RegisterResponse(string Email, bool EmailVerificationRequired);
