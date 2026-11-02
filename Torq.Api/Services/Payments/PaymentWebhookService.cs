using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Torq.Api.Common;
using Torq.Api.Data;
using Torq.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Torq.Api.Services.Payments;

public sealed class PaymentWebhookService(TorqDbContext db, IConfiguration configuration) : IPaymentWebhookService
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task HandleAsync(string body, string signature, CancellationToken ct)
    {
        var secret = configuration["Payments:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new AppException("Payment webhook is not configured.", HttpStatusCode.ServiceUnavailable);
        }

        if (!SignatureMatches(secret, body, signature))
        {
            throw new AppException("Invalid payment webhook signature.", HttpStatusCode.Unauthorized);
        }

        var payload = JsonSerializer.Deserialize<PaymentWebhookBody>(body, JsonOptions)
                      ?? throw new AppException("Webhook body is not valid.");
        if (string.IsNullOrWhiteSpace(payload.ExternalId))
        {
            throw new AppException("Webhook external id is required.");
        }

        var outcomeText = payload.Outcome?.Trim().ToLowerInvariant();
        var type = payload.Type?.Trim().ToLowerInvariant();
        if (type is "refund")
        {
            await ApplyRefundAsync(payload.ExternalId, ParseOutcome(payload.Outcome), ct);
            return;
        }

        if (outcomeText is "cancelled" or "canceled")
        {
            await ApplyCancellationAsync(payload.ExternalId, ct);
            return;
        }

        var outcome = ParseOutcome(payload.Outcome);
        if (type is "payment" or "charge")
        {
            await ApplyChargeAsync(payload.ExternalId, outcome, ct);
            return;
        }

        if (type is "payout")
        {
            await ApplyPayoutAsync(payload.ExternalId, outcome, ct);
            return;
        }

        throw new AppException("Webhook type is not recognized.");
    }

    private async Task ApplyChargeAsync(string externalId, ProviderOutcome outcome, CancellationToken ct)
    {
        var payment = await db.Payments.FirstOrDefaultAsync(x => x.ExternalPaymentId == externalId, ct)
                      ?? throw new AppException("Payment was not found.", HttpStatusCode.NotFound);
        var target = ToPaymentStatus(outcome);
        if (payment.Status == target)
        {
            return;
        }

        if (payment.Status is PaymentStatus.Succeeded or PaymentStatus.Failed or PaymentStatus.Refunded or PaymentStatus.Cancelled)
        {
            throw new AppException("Payment is already in a final state.", HttpStatusCode.Conflict);
        }

        payment.Status = target;
        if (target == PaymentStatus.Succeeded)
        {
            payment.PaidAt = DateTime.UtcNow;
            var campaign = await db.Campaigns.Include(x => x.Milestones).FirstAsync(x => x.Id == payment.CampaignId, ct);
            if (campaign.Status == CampaignStatus.PendingFunding)
            {
                campaign.Status = CampaignStatus.Active;
                campaign.StartedAt = DateTime.UtcNow;
                foreach (var milestone in campaign.Milestones)
                {
                    if (milestone.Status == MilestoneStatus.Planned)
                    {
                        milestone.Status = MilestoneStatus.Funded;
                    }
                }
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task ApplyRefundAsync(string externalId, ProviderOutcome outcome, CancellationToken ct)
    {
        var payment = await db.Payments.FirstOrDefaultAsync(x => x.ExternalPaymentId == externalId, ct)
                      ?? throw new AppException("Payment was not found.", HttpStatusCode.NotFound);
        if (outcome == ProviderOutcome.Failed || payment.Status == PaymentStatus.Refunded || outcome != ProviderOutcome.Succeeded)
        {
            return;
        }

        if (payment.Status != PaymentStatus.Succeeded)
        {
            throw new AppException("Payment is already in a final state.", HttpStatusCode.Conflict);
        }

        var paidOut = await db.Payouts.AnyAsync(
            x => x.CampaignId == payment.CampaignId && (x.Status == PayoutStatus.Paid || x.Status == PayoutStatus.Processing),
            ct);
        if (paidOut)
        {
            throw new AppException("Payouts have already started, so this payment cannot be refunded.", HttpStatusCode.Conflict);
        }

        payment.Status = PaymentStatus.Refunded;
        var campaign = await db.Campaigns.FirstAsync(x => x.Id == payment.CampaignId, ct);
        campaign.Status = CampaignStatus.Cancelled;
        await db.SaveChangesAsync(ct);
    }

    private async Task ApplyCancellationAsync(string externalId, CancellationToken ct)
    {
        var payment = await db.Payments.FirstOrDefaultAsync(x => x.ExternalPaymentId == externalId, ct)
                      ?? throw new AppException("Payment was not found.", HttpStatusCode.NotFound);
        if (payment.Status == PaymentStatus.Cancelled)
        {
            return;
        }

        if (payment.Status != PaymentStatus.Processing && payment.Status != PaymentStatus.Pending)
        {
            throw new AppException("Payment is already in a final state.", HttpStatusCode.Conflict);
        }

        payment.Status = PaymentStatus.Cancelled;
        await db.SaveChangesAsync(ct);
    }

    private async Task ApplyPayoutAsync(string externalId, ProviderOutcome outcome, CancellationToken ct)
    {
        var payout = await db.Payouts
            .Include(x => x.Campaign).ThenInclude(x => x.Requirement)
            .Include(x => x.Campaign).ThenInclude(x => x.Milestones)
            .FirstOrDefaultAsync(x => x.ExternalPayoutId == externalId, ct)
            ?? throw new AppException("Payout was not found.", HttpStatusCode.NotFound);
        var target = ToPayoutStatus(outcome);
        if (payout.Status == target)
        {
            return;
        }

        if (payout.Status is PayoutStatus.Paid or PayoutStatus.Failed)
        {
            throw new AppException("Payout is already in a final state.", HttpStatusCode.Conflict);
        }

        payout.Status = target;
        if (target != PayoutStatus.Paid)
        {
            await db.SaveChangesAsync(ct);
            return;
        }

        var milestone = payout.Campaign.Milestones.FirstOrDefault(x => x.Id == payout.MilestoneId)
                        ?? throw new AppException("Milestone was not found.", HttpStatusCode.NotFound);
        if (milestone.Status != MilestoneStatus.Approved && milestone.Status != MilestoneStatus.Paid)
        {
            throw new AppException("Milestone is not ready for payout.", HttpStatusCode.Conflict);
        }

        var captured = await db.Payments.Where(x => x.CampaignId == payout.CampaignId && x.Status == PaymentStatus.Succeeded)
            .SumAsync(x => x.Amount, ct);
        var already = await db.Payouts.Where(x => x.CampaignId == payout.CampaignId && x.Id != payout.Id
            && (x.Status == PayoutStatus.Paid || x.Status == PayoutStatus.Processing))
            .SumAsync(x => x.GrossAmount, ct);
        if (payout.GrossAmount <= 0 || already + payout.GrossAmount > captured)
        {
            throw new AppException("Payout would exceed the captured amount.");
        }

        var now = DateTime.UtcNow;
        payout.PaidAt = now;
        milestone.Status = MilestoneStatus.Paid;
        milestone.PaidAt = now;
        var remaining = payout.Campaign.Milestones.Count(x => x.Id != milestone.Id && x.Status != MilestoneStatus.Paid);
        if (remaining == 0)
        {
            payout.Campaign.Status = CampaignStatus.Completed;
            payout.Campaign.CompletedAt = now;
            payout.Campaign.Requirement.Status = RequirementStatus.Closed;
        }
        else
        {
            payout.Campaign.Status = CampaignStatus.Active;
        }

        await db.SaveChangesAsync(ct);
    }

    private static bool SignatureMatches(string secret, string body, string provided)
    {
        if (string.IsNullOrWhiteSpace(provided))
        {
            return false;
        }

        var expected = Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(body)));
        var given = provided.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase)
            ? provided[7..]
            : provided;
        var left = Encoding.UTF8.GetBytes(expected);
        var right = Encoding.UTF8.GetBytes(given.Trim().ToUpperInvariant());
        return left.Length == right.Length && CryptographicOperations.FixedTimeEquals(left, right);
    }

    private static ProviderOutcome ParseOutcome(string? value) => value?.Trim().ToLowerInvariant() switch
    {
        "succeeded" or "paid" or "success" => ProviderOutcome.Succeeded,
        "failed" or "failure" or "declined" => ProviderOutcome.Failed,
        "processing" or "pending" => ProviderOutcome.Processing,
        _ => throw new AppException("Webhook outcome is not recognized.")
    };

    private static PaymentStatus ToPaymentStatus(ProviderOutcome outcome) => outcome switch
    {
        ProviderOutcome.Succeeded => PaymentStatus.Succeeded,
        ProviderOutcome.Failed => PaymentStatus.Failed,
        _ => PaymentStatus.Processing
    };

    private static PayoutStatus ToPayoutStatus(ProviderOutcome outcome) => outcome switch
    {
        ProviderOutcome.Succeeded => PayoutStatus.Paid,
        ProviderOutcome.Failed => PayoutStatus.Failed,
        _ => PayoutStatus.Processing
    };

    private sealed class PaymentWebhookBody
    {
        public string? ExternalId { get; set; }
        public string? Type { get; set; }
        public string? Outcome { get; set; }
    }
}
