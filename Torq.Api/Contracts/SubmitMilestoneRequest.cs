namespace Torq.Api.Contracts;

public sealed record SubmitMilestoneRequest(IReadOnlyList<AttachFileRequest>? Deliverables = null);
