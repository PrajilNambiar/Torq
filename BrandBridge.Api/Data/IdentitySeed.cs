using BrandBridge.Api.Domain.Entities;
using BrandBridge.Api.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace BrandBridge.Api.Data;

public static class IdentitySeed
{
    public static async Task EnsureAdminAsync(IServiceProvider services)
    {
        var config = services.GetRequiredService<IConfiguration>();
        var email = config["Seed:AdminEmail"] ?? "admin@brandbridge.local";
        var password = config["Seed:AdminPassword"] ?? "Admin12345!";
        var users = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roles = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        foreach (var name in new[] { nameof(UserRole.Business), nameof(UserRole.Provider), nameof(UserRole.Admin) })
        {
            if (!await roles.RoleExistsAsync(name))
            {
                await roles.CreateAsync(new IdentityRole<Guid>(name) { Id = Guid.NewGuid() });
            }
        }

        if (string.IsNullOrWhiteSpace(password) || await users.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var admin = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            DisplayName = "BrandBridge Admin",
            Role = UserRole.Admin,
            Status = UserStatus.Active
        };

        var created = await users.CreateAsync(admin, password);
        if (created.Succeeded)
        {
            await users.AddToRoleAsync(admin, nameof(UserRole.Admin));
        }
    }
}
