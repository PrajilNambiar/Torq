namespace BrandBridge.Api.Domain.Enums;

public enum PaymentStatus
{
    Pending = 1,
    Processing = 2,
    Succeeded = 3,
    Failed = 4,
    Refunded = 5,
    Cancelled = 6
}
