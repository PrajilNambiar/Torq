using System.Net;
using BrandBridge.Api.Auth;
using BrandBridge.Api.Common;
using BrandBridge.Api.Contracts;
using BrandBridge.Api.Data.Repositories.Interfaces;
using BrandBridge.Api.Domain.Entities;
using BrandBridge.Api.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace BrandBridge.Api.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> users,
    RoleManager<IdentityRole<Guid>> roles,
    IBusinessRepository businesses,
    IProviderRepository providers,
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IAuditRepository audit,
    IJwtTokenService jwt) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        if (request.Role is not (UserRole.Business or UserRole.Provider))
        {
            throw new AppException("Role must be Business or Provider.");
        }

        await EnsureRolesAsync();

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
            Role = request.Role,
            Status = UserStatus.Active,
            EmailConfirmed = true
        };

        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new AppException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        await users.AddToRoleAsync(user, request.Role.ToString());

        if (request.Role == UserRole.Business)
        {
            businesses.Add(new Business
            {
                Id = Guid.NewGuid(),
                OwnerUserId = user.Id,
                LegalName = request.DisplayName,
                DisplayName = request.DisplayName,
                Status = BusinessStatus.Active
            });
        }
        else
        {
            providers.Add(new ProviderProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Status = ProviderStatus.Unverified
            });
        }

        await unitOfWork.SaveChangesAsync(ct);
        await audit.WriteAsync(user.Id, "User", user.Id, "Registered", cancellationToken: ct);
        return new AuthResponse(jwt.CreateToken(user), user.Id, user.Role, user.DisplayName);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email)
                   ?? throw new AppException("Invalid credentials.", HttpStatusCode.Unauthorized);

        if (user.Status == UserStatus.Suspended)
        {
            throw new AppException("Account is suspended.", HttpStatusCode.Forbidden);
        }

        if (!await users.CheckPasswordAsync(user, request.Password))
        {
            throw new AppException("Invalid credentials.", HttpStatusCode.Unauthorized);
        }

        user.LastLoginAt = DateTime.UtcNow;
        await users.UpdateAsync(user);
        return new AuthResponse(jwt.CreateToken(user), user.Id, user.Role, user.DisplayName);
    }

    public async Task<MeResponse> MeAsync(Guid userId, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(userId, tracking: false, ct)
                   ?? throw new AppException("User not found.", HttpStatusCode.NotFound);
        var (businessId, providerId) = await userRepository.GetProfileIdsAsync(userId, ct);
        return new MeResponse(user.Id, user.Email ?? string.Empty, user.DisplayName, user.Role, user.Status, businessId, providerId);
    }

    private async Task EnsureRolesAsync()
    {
        foreach (var name in new[] { nameof(UserRole.Business), nameof(UserRole.Provider), nameof(UserRole.Admin) })
        {
            if (!await roles.RoleExistsAsync(name))
            {
                await roles.CreateAsync(new IdentityRole<Guid>(name) { Id = Guid.NewGuid() });
            }
        }
    }
}
