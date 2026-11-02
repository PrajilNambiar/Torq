namespace Torq.Api.Contracts;

public sealed record SendOtpRequest(string Email);
public sealed record VerifyOtpRequest(string Email, string Code);
