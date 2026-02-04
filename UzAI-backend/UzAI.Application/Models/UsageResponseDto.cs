using UzAI.Domain.Models;

namespace UzAI.Application.Models;

public class UsageResponseDto
{
	public IReadOnlyList<UsageRecord> Records { get; init; } = null!;
	public UsageMetricsDto Metrics { get; init; } = null!;
}
