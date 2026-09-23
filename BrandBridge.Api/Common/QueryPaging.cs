namespace BrandBridge.Api.Common;

public static class QueryPaging
{
    public const int MaxPageSize = 50;

    public static (int Page, int PageSize) Normalize(int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : Math.Min(pageSize, MaxPageSize);
        return (page, pageSize);
    }
}
