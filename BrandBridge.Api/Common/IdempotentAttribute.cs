using Microsoft.AspNetCore.Mvc.Filters;

namespace BrandBridge.Api.Common;

[AttributeUsage(AttributeTargets.Method)]
public sealed class IdempotentAttribute : Attribute, IFilterFactory
{
    public bool IsReusable => false;

    public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
        => serviceProvider.GetRequiredService<IdempotencyActionFilter>();
}
