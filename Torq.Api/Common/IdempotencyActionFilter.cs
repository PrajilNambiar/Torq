using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
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
        var required = context.ActionDescriptor.EndpointMetadata.OfType<RequireIdempotencyKeyAttribute>().Any();
        var key = context.HttpContext.Request.Headers["Idempotency-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(key))
        {
            if (required)
            {
                context.Result = new ObjectResult(new { error = "Idempotency-Key header is required." })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
                return;
            }

            await next();
            return;
        }

        var userIdText = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdText, out var userId))
        {
            await next();
            return;
        }

        var path = context.HttpContext.Request.Path.Value ?? string.Empty;
        var hash = RequestHash(context.HttpContext.Request.Method, path);
        var existing = await db.IdempotencyRecords.AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Key == key);
        if (existing is not null && existing.ExpiresAt > DateTime.UtcNow)
        {
            if (!HashMatches(existing, hash, path))
            {
                context.Result = new ObjectResult(new { error = "Idempotency-Key was already used for a different request." })
                {
                    StatusCode = StatusCodes.Status409Conflict
                };
                return;
            }

            context.Result = new ContentResult
            {
                StatusCode = existing.StatusCode,
                Content = existing.ResponseBody,
                ContentType = "application/json"
            };
            return;
        }

        var executed = await next();
        if (executed.Exception is AppException app)
        {
            executed.ExceptionHandled = true;
            executed.Exception = null;
            executed.Result = new ObjectResult(new { error = app.Message, code = (int)app.StatusCode })
            {
                StatusCode = (int)app.StatusCode
            };
        }
        else if (executed.Exception is not null)
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

        var record = await db.IdempotencyRecords.FirstOrDefaultAsync(x => x.UserId == userId && x.Key == key);
        if (record is null)
        {
            db.IdempotencyRecords.Add(new IdempotencyRecord
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Key = key,
                RequestHash = hash,
                StatusCode = status,
                ResponseBody = body,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            });
        }
        else
        {
            record.RequestHash = hash;
            record.StatusCode = status;
            record.ResponseBody = body;
            record.CreatedAt = DateTime.UtcNow;
            record.ExpiresAt = DateTime.UtcNow.AddHours(24);
        }

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
        }
    }

    private static bool HashMatches(IdempotencyRecord existing, string hash, string path)
        => string.Equals(existing.RequestHash, hash, StringComparison.Ordinal)
           || string.Equals(existing.RequestHash, path, StringComparison.Ordinal);

    private static string RequestHash(string method, string path)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes($"{method}:{path}"));
        return Convert.ToHexString(bytes);
    }
}
