using Torq.Api.Contracts;

namespace Torq.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<MeResponse> MeAsync(Guid userId, CancellationToken ct);
}
