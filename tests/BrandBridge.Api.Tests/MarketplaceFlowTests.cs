using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;
using FluentAssertions;

namespace BrandBridge.Api.Tests;

public sealed class MarketplaceFlowTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public MarketplaceFlowTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_rejects_invalid_email()
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest("not-an-email", "Password123", "x", UserRole.Business));
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Health_returns_ok()
    {
        var response = await _client.GetAsync("/api/v1/health");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Provider_cannot_create_requirement()
    {
        var provider = await Register("provider-deny@test.local", UserRole.Provider);
        UseToken(provider.AccessToken);
        var response = await _client.PostAsJsonAsync("/api/v1/requirements", ValidRequirement());
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Core_marketplace_loop_completes()
    {
        var business = await Register("biz@test.local", UserRole.Business);
        var provider = await Register("pro@test.local", UserRole.Provider);
        var admin = await Login("admin@brandbridge.local", "Admin12345!");

        UseToken(provider.AccessToken);
        var profile = await (await _client.PutAsJsonAsync("/api/v1/providers/me", new UpdateProviderRequest(
            ProviderType.Creator, "UGC creator", "Food content", "Kochi", "Kerala", "en", "ugc", 10000, 50000, "Available")))
            .EnsureSuccess().Content.ReadFromJsonAsync<ProviderDto>();
        profile!.Status.Should().Be(ProviderStatus.VerificationPending);
        (await _client.PostAsJsonAsync("/api/v1/providers/me/services", new UpsertServiceRequest("ugc", "Reels", null, 15000, PricingModel.Fixed, 14)))
            .EnsureSuccess();
        (await _client.PostAsJsonAsync("/api/v1/providers/me/portfolio", new CreatePortfolioRequest("Cafe launch", "5 reels", "F&B", null, "50k views")))
            .EnsureSuccess();
        (await _client.GetAsync("/api/v1/opportunities")).StatusCode.Should().Be(HttpStatusCode.Forbidden);

        UseToken(admin.AccessToken);
        (await _client.PostAsJsonAsync($"/api/v1/admin/providers/{profile.Id}/verify", new { })).EnsureSuccess();

        UseToken(business.AccessToken);
        var created = await (await _client.PostAsJsonAsync("/api/v1/requirements", ValidRequirement()))
            .EnsureSuccess().Content.ReadFromJsonAsync<RequirementDto>();
        created!.Status.Should().Be(RequirementStatus.Draft);
        created.TimelineNotes.Should().Be("Need drafts by week 2");
        created.SelectionPreference.Should().Be("Audience match + quality");
        created.ProposalDeadlineAt.Should().NotBeNull();
        created.Assets.Should().BeEmpty();
        (await _client.PostAsync($"/api/v1/requirements/{created.Id}/submit", null)).EnsureSuccess();

        UseToken(admin.AccessToken);
        (await _client.PostAsJsonAsync($"/api/v1/admin/requirements/{created.Id}/open", new AdminDecisionRequest("ok"))).EnsureSuccess();

        UseToken(provider.AccessToken);
        var opportunities = await _client.GetFromJsonAsync<PagedResult<OpportunityDto>>("/api/v1/opportunities");
        opportunities!.Items.Should().Contain(x => x.Id == created.Id);

        var proposal = await (await _client.PostAsJsonAsync("/api/v1/proposals", new UpsertProposalRequest(
            created.Id, PricingModel.Milestone, 60000, "5 reels + 10 stories", "5 reels, 10 stories", 28, null, "estimates only", 1, null, null, "Let's go", true,
            [new ProposalMilestoneDto(1, "Content", "Drafts + posting", 60000, null)])))
            .EnsureSuccess().Content.ReadFromJsonAsync<ProposalDto>();
        proposal!.Status.Should().Be(ProposalStatus.Submitted);

        UseToken(business.AccessToken);
        var compared = await _client.GetFromJsonAsync<List<ProposalDto>>($"/api/v1/requirements/{created.Id}/proposals");
        compared.Should().HaveCount(1);
        var campaign = await (await _client.PostAsync($"/api/v1/requirements/{created.Id}/select/{proposal.Id}", null))
            .EnsureSuccess().Content.ReadFromJsonAsync<CampaignDto>();
        campaign!.Status.Should().Be(CampaignStatus.PendingFunding);
        async Task<HttpResponseMessage> FundAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/campaigns/{campaign.Id}/fund");
            request.Headers.TryAddWithoutValidation("Idempotency-Key", "fund-1");
            return await _client.SendAsync(request);
        }

        (await FundAsync()).EnsureSuccess();
        (await FundAsync()).EnsureSuccess();
        var leak = await _client.PostAsJsonAsync($"/api/v1/campaigns/{campaign.Id}/messages", new CreateMessageRequest("Call me at 9876543210 or  nina.v@example.com"));
        leak.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        (await _client.PostAsJsonAsync($"/api/v1/campaigns/{campaign.Id}/messages", new CreateMessageRequest("Brand kit attached in workspace.")))
            .EnsureSuccess();

        var milestones = await _client.GetFromJsonAsync<List<MilestoneDto>>($"/api/v1/campaigns/{campaign.Id}/milestones");
        var milestoneId = milestones!.Single().Id;

        UseToken(provider.AccessToken);
        (await _client.PostAsync($"/api/v1/milestones/{milestoneId}/submit", null)).EnsureSuccess();

        UseToken(business.AccessToken);
        (await _client.PostAsync($"/api/v1/milestones/{milestoneId}/approve", null)).EnsureSuccess();
        (await _client.PostAsync($"/api/v1/milestones/{milestoneId}/payout", null)).EnsureSuccess();
        (await _client.PostAsJsonAsync($"/api/v1/campaigns/{campaign.Id}/reviews", new CreateReviewRequest(5, "Great work"))).EnsureSuccess();

        var done = await _client.GetFromJsonAsync<CampaignDto>($"/api/v1/campaigns/{campaign.Id}");
        done!.Status.Should().Be(CampaignStatus.Completed);
    }

    private async Task<AuthResponse> Register(string email, UserRole role)
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest(email, "Password123", email.Split('@')[0], role));
        response.EnsureSuccess();
        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    private async Task<AuthResponse> Login(string email, string password)
    {
        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, password));
        response.EnsureSuccess();
        return (await response.Content.ReadFromJsonAsync<AuthResponse>())!;
    }

    private void UseToken(string token)
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    private static CreateRequirementRequest ValidRequirement() => new(
        "Create 5 Instagram reels for cafe launch",
        "ugc",
        "Reach local customers",
        "Age 18-35 food lovers",
        "Kochi",
        "en,ml",
        "5 reels, 10 stories",
        50000,
        80000,
        28,
        "Need drafts by week 2",
        "Audience match + quality",
        DateTime.UtcNow.AddDays(5));
}

internal static class HttpResponseExtensions
{
    public static HttpResponseMessage EnsureSuccess(this HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return response;
    }
}
