using Microsoft.Data.Sqlite;

namespace BrandBridge.Api.Data;

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
