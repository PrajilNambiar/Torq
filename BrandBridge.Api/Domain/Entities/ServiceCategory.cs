namespace BrandBridge.Api.Domain.Entities;

public class ServiceCategory
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsMvp { get; set; } = true;
    public int SortOrder { get; set; }
}
