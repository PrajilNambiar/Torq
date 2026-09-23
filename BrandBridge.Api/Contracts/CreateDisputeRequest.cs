namespace BrandBridge.Api.Contracts;

public sealed record CreateDisputeRequest(string Reason, IReadOnlyList<AttachFileRequest>? Evidence = null);
