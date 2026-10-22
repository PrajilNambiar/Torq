namespace Torq.Api.Contracts;

public sealed record CreateReviewRequest(int Rating, string? Comment);
