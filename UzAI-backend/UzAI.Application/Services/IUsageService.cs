using UzAI.Application.Models;

namespace UzAI.Application.Services;

public interface IUsageService
{
	Task<UsageResponseDto> GetUsageWithMetricsAsync(CancellationToken cancellationToken = default);
}
