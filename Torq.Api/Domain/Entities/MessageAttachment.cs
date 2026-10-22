namespace Torq.Api.Domain.Entities;

public class MessageAttachment
{
    public Guid Id { get; set; }
    public Guid MessageId { get; set; }
    public Message Message { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string StorageKey { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}
