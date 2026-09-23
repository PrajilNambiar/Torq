namespace BrandBridge.Api.Contracts;

public sealed record SubmitMilestoneRequest(IReadOnlyList<AttachFileRequest>? Deliverables = null);
