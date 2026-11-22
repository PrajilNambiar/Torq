using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Torq.Api.Data;

public sealed class TorqDesignTimeDbContextFactory : IDesignTimeDbContextFactory<TorqDbContext>
{
    public TorqDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<TorqDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=torq;Username=postgres;Password=postgres")
            .Options;
        return new TorqDbContext(options);
    }
}
