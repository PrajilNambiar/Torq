using System.Net;
using System.Security.Cryptography;
using System.Text;
using Torq.Api.Common;
using Torq.Api.Data;
using Torq.Api.Domain.Entities;
using Torq.Api.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Services;

public sealed class EmailOtpService(
    TorqDbContext db,
    IEmailSender emailSender,
    IConfiguration configuration,
    IHostEnvironment environment) : IEmailOtpService
{
    public async Task SendAsync(string email, CancellationToken ct)
    {
        email = Normalize(email);
        var cooldown = ReadInt("Otp:ResendCooldownSeconds", 60);
        var latest = await db.EmailOtpChallenges.AsNoTracking()
            .Where(x => x.Email == email)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);
        if (latest is not null && latest.CreatedAt.AddSeconds(cooldown) > DateTime.UtcNow)
        {
            throw new AppException("Wait before requesting another code.", HttpStatusCode.TooManyRequests);
        }

        var code = CreateCode();
        var lifetime = ReadInt("Otp:LifetimeSeconds", 600);
        var expires = lifetime <= 0 ? DateTime.UtcNow.AddSeconds(-1) : DateTime.UtcNow.AddSeconds(lifetime);
        db.EmailOtpChallenges.Add(new EmailOtpChallenge
        {
            Id = Guid.NewGuid(),
            Email = email,
            CodeHash = Hash(email, code),
            ExpiresAt = expires
        });
        await emailSender.SendAsync(email, "Your Torq verification code", $"Your verification code is {code}. It expires soon.", ct);
        await db.SaveChangesAsync(ct);
    }

    public async Task VerifyAsync(string email, string code, CancellationToken ct)
    {
        email = Normalize(email);
        var challenge = await db.EmailOtpChallenges
            .Where(x => x.Email == email && x.ConsumedAt == null)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);
        if (challenge is null)
        {
            var used = await db.EmailOtpChallenges.AnyAsync(x => x.Email == email && x.ConsumedAt != null, ct);
            throw new AppException(used ? "Verification code has already been used." : "Verification code is invalid.");
        }
        if (challenge.ExpiresAt <= DateTime.UtcNow)
        {
            throw new AppException("Verification code has expired.");
        }

        var maxAttempts = ReadInt("Otp:MaxAttempts", 5);
        if (challenge.Attempts >= maxAttempts)
        {
            throw new AppException("Too many attempts. Request a new code.");
        }

        challenge.Attempts++;
        if (!string.Equals(challenge.CodeHash, Hash(email, code.Trim()), StringComparison.Ordinal))
        {
            await db.SaveChangesAsync(ct);
            throw new AppException("Verification code is invalid.");
        }

        challenge.ConsumedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    private string CreateCode()
    {
        var configured = configuration["Otp:FixedCode"];
        if (!environment.IsProduction() && !string.IsNullOrWhiteSpace(configured))
        {
            return configured.Trim();
        }

        return RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
    }

    private string Hash(string email, string code)
    {
        var pepper = configuration["Otp:Pepper"];
        if (string.IsNullOrWhiteSpace(pepper))
        {
            pepper = configuration["Jwt:Key"] ?? "torq";
        }

        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{pepper}:{email}:{code}")));
    }

    private int ReadInt(string key, int fallback)
        => int.TryParse(configuration[key], out var value) ? value : fallback;

    private static string Normalize(string email) => email.Trim().ToLowerInvariant();
}
