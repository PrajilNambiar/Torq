namespace BrandBridge.Api.Contracts;

public sealed record CreateMessageRequest(string Body, IReadOnlyList<AttachFileRequest>? Attachments = null);
