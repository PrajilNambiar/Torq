namespace Torq.Api.Domain.Entities;

public class RequirementQuestion
{
    public Guid Id { get; set; }
    public Guid RequirementId { get; set; }
    public Requirement Requirement { get; set; } = null!;
    public Guid AuthorUserId { get; set; }
    public string Body { get; set; } = string.Empty;
    public string? Answer { get; set; }
    public DateTime? AnsweredAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
