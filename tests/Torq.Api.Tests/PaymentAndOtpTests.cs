using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Torq.Api.Contracts;
using Torq.Api.Domain.Enums;
using FluentAssertions;

namespace Torq.Api.Tests;

public sealed class PaymentAndOtpTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public PaymentAndOtpTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Otp_can_be_verified_once()
    {
        var send = await _client.PostAsJsonAsync("/api/v1/auth/otp/send", new SendOtpRequest("User@test.local"));
        send.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var again = await _client.PostAsJsonAsync("/api/v1/auth/otp/send", new SendOtpRequest("user@test.local"));
        again.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);

        var ok = await _client.PostAsJsonAsync("/api/v1/auth/otp/verify", new VerifyOtpRequest("user@test.local", "123456"));
        ok.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var reused = await _client.PostAsJsonAsync("/api/v1/auth/otp/verify", new VerifyOtpRequest("user@test.local", "123456"));
        reused.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await reused.Content.ReadAsStringAsync()).Should().Contain("already been used");
    }

    [Fact]
    public async Task Otp_locks_after_too_many_wrong_codes()
    {
        (await _client.PostAsJsonAsync("/api/v1/auth/otp/send", new SendOtpRequest("locked@test.local"))).EnsureSuccess();
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var wrong = await _client.PostAsJsonAsync("/api/v1/auth/otp/verify", new VerifyOtpRequest("locked@test.local", "000000"));
            wrong.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        var correct = await _client.PostAsJsonAsync("/api/v1/auth/otp/verify", new VerifyOtpRequest("locked@test.local", "123456"));
        correct.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await correct.Content.ReadAsStringAsync()).Should().Contain("Too many attempts");
    }

    [Fact]
    public async Task Fund_rejects_milestone_amounts_that_do_not_match_the_agreed_price()
    {
        var campaign = await MarketplaceSetup.CreatePendingCampaignAsync(_client, "mismatch", 10000);
        var response = await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-mismatch");
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await response.Content.ReadAsStringAsync()).Should().Contain("agreed price");
        var pending = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        pending!.Status.Should().Be(CampaignStatus.PendingFunding);
    }

    [Fact]
    public async Task Refund_cancels_a_captured_payment_until_a_payout_starts()
    {
        var campaign = await MarketplaceSetup.CreatePendingCampaignAsync(_client, "refund");
        (await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-refund")).EnsureSuccess();
        var missing = await _client.PostAsync($"/api/v1/campaigns/{campaign.CampaignId}/refund", null);
        missing.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        (await MarketplaceSetup.PostAsync(_client, $"/api/v1/campaigns/{campaign.CampaignId}/refund", "refund-1")).EnsureSuccess();
        (await MarketplaceSetup.PostAsync(_client, $"/api/v1/campaigns/{campaign.CampaignId}/refund", "refund-1")).EnsureSuccess();
        var cancelled = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        cancelled!.Status.Should().Be(CampaignStatus.Cancelled);

        var again = await MarketplaceSetup.PostAsync(_client, $"/api/v1/campaigns/{campaign.CampaignId}/refund", "refund-2");
        again.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Webhook_rejects_a_bad_signature()
    {
        var response = await _client.SendAsync(WebhookRequests.SignedWebhook("{\"externalId\":\"missing\",\"type\":\"payment\",\"outcome\":\"Succeeded\"}", "wrong"));
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}

public sealed class ExpiredOtpTests : IClassFixture<ExpiredOtpFactory>
{
    private readonly HttpClient _client;

    public ExpiredOtpTests(ExpiredOtpFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Expired_code_is_rejected()
    {
        (await _client.PostAsJsonAsync("/api/v1/auth/otp/send", new SendOtpRequest("expired@test.local"))).EnsureSuccess();
        var response = await _client.PostAsJsonAsync("/api/v1/auth/otp/verify", new VerifyOtpRequest("expired@test.local", "123456"));
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await response.Content.ReadAsStringAsync()).Should().Contain("expired");
    }
}

public sealed class UnconfiguredWebhookTests : IClassFixture<UnconfiguredWebhookFactory>
{
    private readonly HttpClient _client;

    public UnconfiguredWebhookTests(UnconfiguredWebhookFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Webhook_is_unavailable_until_a_secret_is_configured()
    {
        var json = "{\"externalId\":\"missing\",\"type\":\"payment\",\"outcome\":\"Succeeded\"}";
        var response = await _client.SendAsync(WebhookRequests.SignedWebhook(json));
        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
    }
}

public sealed class FailedPaymentTests : IClassFixture<FailedPaymentFactory>
{
    private readonly HttpClient _client;

    public FailedPaymentTests(FailedPaymentFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Declined_charge_does_not_activate_the_campaign_and_the_same_key_is_replayed()
    {
        var campaign = await MarketplaceSetup.CreatePendingCampaignAsync(_client, "failed");
        var first = await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-fail");
        first.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);

        var replay = await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-fail");
        replay.StatusCode.Should().Be(HttpStatusCode.PaymentRequired);
        var pending = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        pending!.Status.Should().Be(CampaignStatus.PendingFunding);

        var retry = await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-retry");
        retry.StatusCode.Should().Be(HttpStatusCode.NoContent);
        var active = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        active!.Status.Should().Be(CampaignStatus.Active);
    }
}

public sealed class PendingPaymentTests : IClassFixture<PendingPaymentFactory>
{
    private readonly HttpClient _client;

    public PendingPaymentTests(PendingPaymentFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Charge_and_payout_stay_pending_until_a_signed_webhook()
    {
        var campaign = await MarketplaceSetup.CreatePendingCampaignAsync(_client, "pending");
        (await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-pending")).StatusCode.Should().Be(HttpStatusCode.NoContent);
        var waiting = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        waiting!.Status.Should().Be(CampaignStatus.PendingFunding);

        var duplicate = await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-other");
        duplicate.StatusCode.Should().Be(HttpStatusCode.Conflict);

        var externalId = $"stub-{campaign.CampaignId}";
        var body = $"{{\"externalId\":\"{externalId}\",\"type\":\"payment\",\"outcome\":\"Succeeded\"}}";
        (await _client.SendAsync(WebhookRequests.SignedWebhook(body))).StatusCode.Should().Be(HttpStatusCode.OK);
        (await _client.SendAsync(WebhookRequests.SignedWebhook(body))).StatusCode.Should().Be(HttpStatusCode.OK);
        var funded = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        funded!.Status.Should().Be(CampaignStatus.Active);

        var milestones = await _client.GetFromJsonAsync<List<MilestoneDto>>($"/api/v1/campaigns/{campaign.CampaignId}/milestones");
        var milestoneId = milestones!.Single().Id;
        MarketplaceSetup.UseToken(_client, campaign.ProviderToken);
        (await _client.PostAsync($"/api/v1/milestones/{milestoneId}/submit", null)).EnsureSuccess();
        MarketplaceSetup.UseToken(_client, campaign.BusinessToken);
        (await _client.PostAsync($"/api/v1/milestones/{milestoneId}/approve", null)).EnsureSuccess();
        (await MarketplaceSetup.PayoutAsync(_client, milestoneId, "payout-pending")).StatusCode.Should().Be(HttpStatusCode.NoContent);
        var stillApproved = await _client.GetFromJsonAsync<List<MilestoneDto>>($"/api/v1/campaigns/{campaign.CampaignId}/milestones");
        stillApproved!.Single().Status.Should().Be(MilestoneStatus.Approved);

        var payoutBody = $"{{\"externalId\":\"stub-{milestoneId}\",\"type\":\"payout\",\"outcome\":\"Succeeded\"}}";
        (await _client.SendAsync(WebhookRequests.SignedWebhook(payoutBody))).StatusCode.Should().Be(HttpStatusCode.OK);
        (await _client.SendAsync(WebhookRequests.SignedWebhook(payoutBody))).StatusCode.Should().Be(HttpStatusCode.OK);
        var done = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        done!.Status.Should().Be(CampaignStatus.Completed);
    }

    [Fact]
    public async Task Failed_webhook_leaves_the_campaign_unfunded()
    {
        var campaign = await MarketplaceSetup.CreatePendingCampaignAsync(_client, "decline-hook");
        (await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-hook-fail")).EnsureSuccess();
        var body = $"{{\"externalId\":\"stub-{campaign.CampaignId}\",\"type\":\"payment\",\"outcome\":\"Failed\"}}";
        (await _client.SendAsync(WebhookRequests.SignedWebhook(body))).StatusCode.Should().Be(HttpStatusCode.OK);
        var loaded = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        loaded!.Status.Should().Be(CampaignStatus.PendingFunding);
    }

    [Fact]
    public async Task Processing_payment_can_be_cancelled_and_a_refund_webhook_cancels_a_captured_one()
    {
        var campaign = await MarketplaceSetup.CreatePendingCampaignAsync(_client, "cancel");
        (await MarketplaceSetup.FundAsync(_client, campaign.CampaignId, "fund-cancel")).EnsureSuccess();
        (await MarketplaceSetup.PostAsync(_client, $"/api/v1/campaigns/{campaign.CampaignId}/cancel-funding", "cancel-1")).EnsureSuccess();
        var pending = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.CampaignId}");
        pending!.Status.Should().Be(CampaignStatus.PendingFunding);

        var again = await MarketplaceSetup.PostAsync(_client, $"/api/v1/campaigns/{campaign.CampaignId}/cancel-funding", "cancel-2");
        again.StatusCode.Should().Be(HttpStatusCode.Conflict);

        var captured = await MarketplaceSetup.CreatePendingCampaignAsync(_client, "refund-hook");
        (await MarketplaceSetup.FundAsync(_client, captured.CampaignId, "fund-hook")).EnsureSuccess();
        var paid = $"{{\"externalId\":\"stub-{captured.CampaignId}\",\"type\":\"payment\",\"outcome\":\"Succeeded\"}}";
        (await _client.SendAsync(WebhookRequests.SignedWebhook(paid))).StatusCode.Should().Be(HttpStatusCode.OK);
        var refund = $"{{\"externalId\":\"stub-{captured.CampaignId}\",\"type\":\"refund\",\"outcome\":\"Succeeded\"}}";
        (await _client.SendAsync(WebhookRequests.SignedWebhook(refund))).StatusCode.Should().Be(HttpStatusCode.OK);
        (await _client.SendAsync(WebhookRequests.SignedWebhook(refund))).StatusCode.Should().Be(HttpStatusCode.OK);
        var cancelled = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{captured.CampaignId}");
        cancelled!.Status.Should().Be(CampaignStatus.Cancelled);
    }
}

internal sealed record PendingCampaign(Guid CampaignId, string BusinessToken, string ProviderToken);

internal static class MarketplaceSetup
{
    public static async Task<PendingCampaign> CreatePendingCampaignAsync(HttpClient client, string prefix, decimal milestoneAmount = 60000)
    {
        var business = await Register(client, $"{prefix}-biz-{Guid.NewGuid():N}@test.local", UserRole.Business);
        var provider = await Register(client, $"{prefix}-pro-{Guid.NewGuid():N}@test.local", UserRole.Provider);
        var admin = await Login(client, "admin@torq.local", "Admin12345!");

        UseToken(client, provider.AccessToken);
        var profile = await (await client.PutAsJsonAsync("/api/v1/providers/me", new UpdateProviderRequest(
            ProviderType.Creator, "UGC creator", "Food content", "Kochi", "Kerala", "en", "ugc", 10000, 50000, "Available")))
            .EnsureSuccess().Content.ReadFromJsonAsync<ProviderDto>();
        (await client.PostAsJsonAsync("/api/v1/providers/me/services", new UpsertServiceRequest("ugc", "Reels", null, 15000, PricingModel.Fixed, 14)))
            .EnsureSuccess();
        (await client.PostAsJsonAsync("/api/v1/providers/me/portfolio", new CreatePortfolioRequest("Cafe launch", "5 reels", "F&B", null, "50k views")))
            .EnsureSuccess();

        UseToken(client, admin.AccessToken);
        (await client.PostAsJsonAsync($"/api/v1/admin/providers/{profile!.Id}/verify", new { })).EnsureSuccess();

        UseToken(client, business.AccessToken);
        var created = await (await client.PostAsJsonAsync("/api/v1/requirements", new CreateRequirementRequest(
            "Create 5 Instagram reels for cafe launch", "ugc", "Reach local customers", "Age 18-35 food lovers", "Kochi", "en,ml",
            "5 reels, 10 stories", 50000, 80000, 28, "Need drafts by week 2", "Audience match + quality", DateTime.UtcNow.AddDays(5))))
            .EnsureSuccess().Content.ReadFromJsonAsync<RequirementDto>();
        (await client.PostAsync($"/api/v1/requirements/{created!.Id}/submit", null)).EnsureSuccess();

        UseToken(client, admin.AccessToken);
        (await client.PostAsJsonAsync($"/api/v1/admin/requirements/{created.Id}/open", new AdminDecisionRequest("ok"))).EnsureSuccess();

        UseToken(client, provider.AccessToken);
        var proposal = await (await client.PostAsJsonAsync("/api/v1/proposals", new UpsertProposalRequest(
            created.Id, PricingModel.Milestone, 60000, "5 reels + 10 stories", "5 reels, 10 stories", 28, null, "estimates only", 1, null, null, "Let's go", true,
            [new ProposalMilestoneDto(1, "Content", "Drafts + posting", milestoneAmount, null)])))
            .EnsureSuccess().Content.ReadFromJsonAsync<ProposalDto>();

        UseToken(client, business.AccessToken);
        var campaign = await (await client.PostAsync($"/api/v1/requirements/{created.Id}/select/{proposal!.Id}", null))
            .EnsureSuccess().Content.ReadFromJsonAsync<CampaignDto>();
        return new PendingCampaign(campaign!.Id, business.AccessToken, provider.AccessToken);
    }

    public static Task<HttpResponseMessage> FundAsync(HttpClient client, Guid campaignId, string key)
        => PostAsync(client, $"/api/v1/campaigns/{campaignId}/fund", key);

    public static Task<HttpResponseMessage> PayoutAsync(HttpClient client, Guid milestoneId, string key)
        => PostAsync(client, $"/api/v1/milestones/{milestoneId}/payout", key);

    public static Task<HttpResponseMessage> PostAsync(HttpClient client, string path, string key)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, path);
        request.Headers.TryAddWithoutValidation("Idempotency-Key", key);
        return client.SendAsync(request);
    }

    public static void UseToken(HttpClient client, string token)
        => client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    private static async Task<AuthResponse> Register(HttpClient client, string email, UserRole role)
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest(email, "Password123", email.Split('@')[0], role));
        response.EnsureSuccess();
        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    private static async Task<AuthResponse> Login(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, password));
        response.EnsureSuccess();
        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }
}

internal static class WebhookRequests
{
    public static HttpRequestMessage SignedWebhook(string json, string? signature = null, string secret = "test-webhook-secret")
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/payments/webhook")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        var sig = signature ?? Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(json)));
        request.Headers.TryAddWithoutValidation("X-Torq-Signature", sig);
        return request;
    }
}
