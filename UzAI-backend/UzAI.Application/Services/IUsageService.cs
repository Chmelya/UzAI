using UzAI.Domain.Models;

namespace UzAI.Application.Services;

public interface IUsageService
{
    Task<IReadOnlyList<UsageRecord>> GetAllAsync(CancellationToken cancellationToken = default);
}
