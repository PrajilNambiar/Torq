using Microsoft.Data.Sqlite;
using Npgsql;

namespace Torq.Api.Data;

public static class DatabaseConfiguration
{
    public const string Postgres = "Postgres";
    public const string Sqlite = "Sqlite";

    public static string ResolveProvider(IConfiguration configuration)
    {
        var provider = configuration["Database:Provider"];
        if (string.IsNullOrWhiteSpace(provider))
        {
            return Postgres;
        }

        return provider.Trim().ToLowerInvariant() switch
        {
            "postgres" or "postgresql" or "npgsql" => Postgres,
            "sqlite" => Sqlite,
            _ => throw new InvalidOperationException(
                $"Unsupported Database:Provider '{provider}'. Use Postgres or Sqlite.")
        };
    }

    public static string ResolvePostgresConnectionString(IConfiguration configuration, bool allowLocal = true)
    {
        var databaseUrl = configuration["DATABASE_URL"];
        if (!string.IsNullOrWhiteSpace(databaseUrl) && !IsLocalConnection(databaseUrl))
        {
            return FromDatabaseUrl(databaseUrl);
        }

        var configured = FromDatabaseUrl(configuration.GetConnectionString("Default")
                         ?? "Host=localhost;Port=5432;Database=torq;Username=postgres;Password=postgres");
        if (allowLocal || !IsLocalConnection(configured))
        {
            return configured;
        }

        var fromFile = ReadPublishedDefaultConnectionString();
        if (!string.IsNullOrWhiteSpace(fromFile))
        {
            var published = FromDatabaseUrl(fromFile);
            if (!IsLocalConnection(published))
            {
                return published;
            }
        }

        return configured;
    }

    public static bool IsLocalConnection(string connectionString)
    {
        var host = new NpgsqlConnectionStringBuilder(FromDatabaseUrl(connectionString)).Host;
        return string.IsNullOrWhiteSpace(host)
               || host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
               || host is "127.0.0.1" or "::1";
    }

    private static string? ReadPublishedDefaultConnectionString()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
        if (!File.Exists(path))
        {
            return null;
        }

        using var document = System.Text.Json.JsonDocument.Parse(File.ReadAllText(path));
        if (document.RootElement.TryGetProperty("ConnectionStrings", out var connections)
            && connections.TryGetProperty("Default", out var value))
        {
            return value.GetString();
        }

        return null;
    }

    public static string FromDatabaseUrl(string databaseUrl)
    {
        if (!databaseUrl.Contains("://", StringComparison.Ordinal))
        {
            return databaseUrl;
        }

        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');
        if (string.IsNullOrWhiteSpace(database))
        {
            throw new InvalidOperationException("DATABASE_URL does not include a database name.");
        }

        var sslMode = uri.Host.Contains('.') ? SslMode.Require : SslMode.Disable;
        var query = uri.Query.TrimStart('?');
        foreach (var part in query.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var pair = part.Split('=', 2);
            if (pair.Length == 2 && pair[0].Equals("sslmode", StringComparison.OrdinalIgnoreCase))
            {
                sslMode = pair[1].ToLowerInvariant() switch
                {
                    "disable" => SslMode.Disable,
                    "allow" => SslMode.Allow,
                    "prefer" => SslMode.Prefer,
                    "require" => SslMode.Require,
                    "verify-ca" => SslMode.VerifyCA,
                    "verify-full" => SslMode.VerifyFull,
                    _ => sslMode
                };
            }
        }

        return new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort ? 5432 : uri.Port,
            Database = database,
            Username = username,
            Password = password,
            SslMode = sslMode
        }.ConnectionString;
    }

    public static void EnsureSqliteDirectory(string connectionString)
    {
        var dataSource = new SqliteConnectionStringBuilder(connectionString).DataSource;
        if (string.IsNullOrWhiteSpace(dataSource)
            || dataSource.Equals(":memory:", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var directory = Path.GetDirectoryName(dataSource);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }
    }
}
