namespace Torq.Api.Domain.Entities;

public class MessageThread
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
