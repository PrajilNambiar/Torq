using System.Security.Claims;
using System.Text.Json;
using Torq.Api.Data;
using Torq.Api.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Common;

public sealed class IdempotencyActionFilter(TorqDbContext db) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var key = context.HttpContext.Request.Headers["Idempotency-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(key))
        {
            await next();
            return;
        }

        var userIdText = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdText, out var userId))
        {
            await next();
            return;
        }

        var existing = await db.IdempotencyRecords.AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Key == key);
        if (existing is not null && existing.ExpiresAt > DateTime.UtcNow)
        {
            context.Result = new ContentResult
            {
                StatusCode = existing.StatusCode,
                Content = existing.ResponseBody,
                ContentType = "application/json"
            };
            return;
        }

        var executed = await next();
        if (executed.Exception is not null)
        {
            return;
        }

        var status = executed.Result switch
        {
            ObjectResult obj => obj.StatusCode ?? StatusCodes.Status200OK,
            StatusCodeResult code => code.StatusCode,
            EmptyResult => StatusCodes.Status204NoContent,
            _ => context.HttpContext.Response.StatusCode
        };

        string body = "{}";
        if (executed.Result is ObjectResult { Value: not null } valueResult)
        {
            body = JsonSerializer.Serialize(valueResult.Value, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }

        db.IdempotencyRecords.Add(new IdempotencyRecord
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Key = key,
            RequestHash = context.HttpContext.Request.Path.Value ?? string.Empty,
            StatusCode = status,
            ResponseBody = body,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        });
        await db.SaveChangesAsync();
    }
}
