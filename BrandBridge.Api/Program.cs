using System.Security.Claims;
using System.Text;
using BrandBridge.Api.Auth;
using BrandBridge.Api.Common;
using BrandBridge.Api.Data;
using BrandBridge.Api.Data.Repositories;
using BrandBridge.Api.Data.Repositories.Interfaces;
using BrandBridge.Api.Domain.Entities;
using BrandBridge.Api.Domain.Enums;
using BrandBridge.Api.Mapping;
using BrandBridge.Api.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

namespace BrandBridge.Api;

public partial class Program
{
    public static async Task Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .CreateLogger();

        var builder = WebApplication.CreateBuilder(args);
        builder.Host.UseSerilog();

        var connectionString = builder.Configuration.GetConnectionString("Default")
                               ?? "Host=localhost;Port=5432;Database=brandbridge;Username=postgres;Password=postgres";

        builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
        builder.Services.Configure<MarketplaceOptions>(builder.Configuration.GetSection("Marketplace"));
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<ICurrentUser, CurrentUser>();
        builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
        builder.Services.AddAutoMapper(typeof(MappingProfile));
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IAuditRepository, AuditRepository>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<IBusinessRepository, BusinessRepository>();
        builder.Services.AddScoped<IProviderRepository, ProviderRepository>();
        builder.Services.AddScoped<IRequirementRepository, RequirementRepository>();
        builder.Services.AddScoped<IProposalRepository, ProposalRepository>();
        builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IMarketplaceService, MarketplaceService>();
        builder.Services.AddScoped<IAdminService, AdminService>();
        builder.Services.AddScoped<IFileStorage, LocalFileStorage>();
        builder.Services.AddScoped<IdempotencyActionFilter>();
        builder.Services.AddFluentValidationAutoValidation();
        builder.Services.AddValidatorsFromAssemblyContaining<Program>();
        builder.Services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddFixedWindowLimiter("auth", limiter =>
            {
                limiter.PermitLimit = 40;
                limiter.Window = TimeSpan.FromMinutes(1);
                limiter.QueueLimit = 0;
            });
            options.AddFixedWindowLimiter("writes", limiter =>
            {
                limiter.PermitLimit = 80;
                limiter.Window = TimeSpan.FromMinutes(1);
                limiter.QueueLimit = 0;
            });
        });

        builder.Services.AddDbContext<BrandBridgeDbContext>(options =>
        {
            if (builder.Environment.IsEnvironment("Testing"))
            {
                options.UseInMemoryDatabase(builder.Configuration["Testing:DbName"] ?? "brandbridge-tests");
                return;
            }

            if (DatabaseConfiguration.ResolveProvider(builder.Configuration) == DatabaseConfiguration.Sqlite)
            {
                var sqlite = builder.Configuration.GetConnectionString("Sqlite")
                             ?? "Data Source=App_Data/brandbridge.db";
                DatabaseConfiguration.EnsureSqliteDirectory(sqlite);
                options.UseSqlite(sqlite);
                return;
            }

            options.UseNpgsql(connectionString);
        });

        builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<BrandBridgeDbContext>()
            .AddDefaultTokenProviders();

        builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer();
        builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<Microsoft.Extensions.Options.IOptions<JwtOptions>>((bearer, jwtOptions) =>
            {
                var settings = jwtOptions.Value;
                var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key)) { KeyId = "brandbridge" };
                bearer.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = settings.Issuer,
                    ValidAudience = settings.Audience,
                    IssuerSigningKey = signingKey,
                    ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
                    RoleClaimType = ClaimTypes.Role,
                    NameClaimType = ClaimTypes.NameIdentifier
                };
            });

        builder.Services.AddAuthorization();
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "BrandBridge API", Version = "v1" });
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "JWT Bearer token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
                    Array.Empty<string>()
                }
            });
        });

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("ui", policy =>
                policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        });

        var app = builder.Build();
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseMiddleware<ExceptionHandlingMiddleware>();
        app.UseMiddleware<RequestTimingMiddleware>();
        app.UseSerilogRequestLogging();
        app.UseCors("ui");
        app.UseRateLimiter();
        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<BrandBridgeDbContext>();
            if (app.Environment.IsEnvironment("Testing")
                || DatabaseConfiguration.ResolveProvider(app.Configuration) == DatabaseConfiguration.Sqlite)
            {
                await db.Database.EnsureCreatedAsync();
            }
            else
            {
                await db.Database.MigrateAsync();
            }

            await IdentitySeed.EnsureAdminAsync(scope.ServiceProvider);
        }

        await app.RunAsync();
    }
}
