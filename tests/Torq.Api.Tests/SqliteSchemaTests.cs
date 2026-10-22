using Torq.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Torq.Api.Tests;

public sealed class SqliteSchemaTests
{
    [Fact]
    public async Task Model_can_be_created_on_sqlite()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<TorqDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var db = new TorqDbContext(options);
        var created = await db.Database.EnsureCreatedAsync();

        Assert.True(created);
        Assert.True(await db.Database.CanConnectAsync());
    }
}

public sealed class DatabaseUrlTests
{
    [Fact]
    public void Render_internal_url_does_not_use_localhost()
    {
        var connectionString = DatabaseConfiguration.FromDatabaseUrl("postgres://user:secret@dpg-abc-a/torq");
        var builder = new NpgsqlConnectionStringBuilder(connectionString);

        Assert.Equal("dpg-abc-a", builder.Host);
        Assert.Equal(5432, builder.Port);
        Assert.Equal("torq", builder.Database);
        Assert.Equal("user", builder.Username);
        Assert.Equal("secret", builder.Password);
        Assert.Equal(SslMode.Disable, builder.SslMode);
    }
}
