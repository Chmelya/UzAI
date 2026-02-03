using Microsoft.EntityFrameworkCore;
using UzAI.Application.Services;
using UzAI.Domain.Models;
using UzAI.Infrastructure.Data;

namespace UzAI.Infrastructure.Services;

public class UsageService : IUsageService
{
    private readonly ApplicationDbContext _context;

    public UsageService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<UsageRecord>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var query = _context.UsageRecords.AsNoTracking();
        var list = await query
            .OrderByDescending(r => r.Timestamp)
            .ToListAsync(cancellationToken);
        return list;
    }
}
