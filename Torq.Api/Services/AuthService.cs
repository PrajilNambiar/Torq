using System.Net;
using Torq.Api.Auth;
using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Data.Repositories.Interfaces;
using Torq.Api.Domain.Entities;
using Torq.Api.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Torq.Api.Services;

public sealed class AuthService(
    UserManager<ApplicationUser> users,
    RoleManager<IdentityRole<Guid>> roles,
    IBusinessRepository businesses,
    IProviderRepository providers,
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IAuditRepository audit,
    IJwtTokenService jwt,
    IEmailOtpService otp,
    IHostEnvironment environment) : IAuthService
{
    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        if (request.Role is not (UserRole.Business or UserRole.Provider))
        {
            throw new AppException("Role must be Business or Provider.");
        }

        var email = (request.Email ?? string.Empty).Trim();
        if (!EmailAddressRules.IsAcceptable(email))
        {
            throw new AppException("A valid email address is required.");
        }

        var phone = NormalizePhone(request.Phone);

        await EnsureRolesAsync();

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            DisplayName = request.DisplayName,
            Role = request.Role,
            Status = UserStatus.Active,
            EmailConfirmed = false,
            PhoneNumber = phone
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
        try
        {
            await otp.SendAsync(email, ct);
        }
        catch (AppException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
        {
            // A code was already sent for this address. The account stays unusable until it is verified.
        }

        return new RegisterResponse(email, EmailVerificationRequired: true);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email)
                   ?? throw new AppException("Invalid credentials.", HttpStatusCode.Unauthorized);

        if (user.Status == UserStatus.Deleted)
        {
            throw new AppException("This account has been deleted.", HttpStatusCode.Forbidden);
        }

        if (user.Status == UserStatus.Suspended)
        {
            throw new AppException("Account is suspended.", HttpStatusCode.Forbidden);
        }

        if (!await users.CheckPasswordAsync(user, request.Password))
        {
            throw new AppException("Invalid credentials.", HttpStatusCode.Unauthorized);
        }

        if (!user.EmailConfirmed)
        {
            throw new AppException("Email is not verified.", HttpStatusCode.Forbidden);
        }

        if (user.Role == UserRole.Admin && !environment.IsEnvironment("Testing"))
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                throw new AppException("Admin sign-in requires a verification code.", HttpStatusCode.Forbidden);
            }

            await otp.VerifyAsync(user.Email ?? request.Email, request.Code, ct);
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

    public async Task DeleteAccountAsync(Guid userId, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(userId.ToString())
                   ?? throw new AppException("User not found.", HttpStatusCode.NotFound);
        if (user.Role == UserRole.Admin)
        {
            throw new AppException("Admin accounts cannot be deleted here.", HttpStatusCode.Forbidden);
        }

        user.Status = UserStatus.Deleted;
        user.Email = $"deleted-{user.Id:N}@torq.invalid";
        user.UserName = user.Email;
        user.NormalizedEmail = user.Email.ToUpperInvariant();
        user.NormalizedUserName = user.NormalizedEmail;
        user.PhoneNumber = null;
        user.DisplayName = "Deleted user";
        user.EmailConfirmed = false;
        await users.UpdateAsync(user);
        await audit.WriteAsync(userId, "User", user.Id, "Deleted", cancellationToken: ct);
    }

    public async Task<PrivacyExportDto> ExportAsync(Guid userId, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(userId, tracking: false, ct)
                   ?? throw new AppException("User not found.", HttpStatusCode.NotFound);
        return new PrivacyExportDto(user.Email ?? string.Empty, user.DisplayName, user.Role.ToString(), user.Status.ToString(), user.PhoneNumber, user.FraudFlagged);
    }

    private static string? NormalizePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return null;
        }

        var trimmed = phone.Trim();
        var digits = trimmed.Count(char.IsDigit);
        if (digits is < 10 or > 15)
        {
            throw new AppException("Enter a valid phone number with 10 to 15 digits.");
        }

        return trimmed;
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
