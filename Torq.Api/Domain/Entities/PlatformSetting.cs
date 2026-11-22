namespace Torq.Api.Domain.Entities;

public class PlatformSetting
{
    public Guid Id { get; set; }
    public decimal PlatformFeePercent { get; set; } = 10;
    public string AllowedGeographies { get; set; } = "IN";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
