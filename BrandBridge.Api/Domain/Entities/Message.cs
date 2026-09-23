using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain.Entities;

public class Message
{
    public Guid Id { get; set; }
    public Guid ThreadId { get; set; }
    public MessageThread Thread { get; set; } = null!;
    public Guid? SenderUserId { get; set; }
    public MessageSenderType SenderType { get; set; } = MessageSenderType.User;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<MessageAttachment> Attachments { get; set; } = new List<MessageAttachment>();
}
