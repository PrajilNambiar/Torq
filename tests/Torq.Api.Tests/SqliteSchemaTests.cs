using Torq.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

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
