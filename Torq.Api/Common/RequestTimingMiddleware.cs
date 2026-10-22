namespace Torq.Api.Common;

public sealed class RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        var started = DateTime.UtcNow;
        await next(context);
        var duration = (DateTime.UtcNow - started).TotalMilliseconds;
        logger.LogInformation(
            "HTTP {Method} {Path} => {Status} in {DurationMs}ms",
            context.Request.Method,
            context.Request.Path.Value,
            context.Response.StatusCode,
            (int)duration);
    }
}
