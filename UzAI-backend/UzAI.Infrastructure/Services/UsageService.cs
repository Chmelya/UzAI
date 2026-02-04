using Microsoft.EntityFrameworkCore;
using UzAI.Application.Models;
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

	public async Task<UsageResponseDto> GetUsageWithMetricsAsync(CancellationToken cancellationToken = default)
	{
		var list = await _context.UsageRecords
			.AsNoTracking()
			.OrderByDescending(r => r.Timestamp)
			.ToListAsync(cancellationToken);

		var metrics = ComputeMetrics(list);
		return new UsageResponseDto { Records = list, Metrics = metrics };
	}

	private static UsageMetricsDto ComputeMetrics(IReadOnlyList<UsageRecord> records)
	{
		if (records.Count == 0)
			return new UsageMetricsDto
			{
				TotalTimeSpent = 0,
				TotalTimeSpentHours = 0,
				TotalTimeSaved = 0,
				TotalTimeSavedHours = 0,
				TotalTimeSavedWithAi = 0,
				TotalTimeSavedHoursWithAi = 0,
				TotalTimeSavedWithoutAi = 0,
				TotalTimeSavedHoursWithoutAi = 0,
				TotalTimeSavedPercentWithAi = 0,
				TotalTimeSavedPercentWithoutAi = 0,
				TotalTimeSavedPercent = 0,
				TasksWithAiPercent = 0,
				AvgRelativeSavingsOnAiTaskOnlySavesPercent = 0,
				AvgRelativeIncreaseOnAiTaskOnlyOverrunsPercent = 0,
				AvgNetRelativeImpactOnAiTaskPercent = 0,
				EstimationErrorUnderPercentWithAi = 0,
				EstimationErrorUnderPercentWithoutAi = 0,
				EstimationErrorOverPercentWithAi = 0,
				EstimationErrorOverPercentWithoutAi = 0
			};

		double totalSaved = records.Sum(r => r.TimeSaved);
		double totalSpent = records.Sum(r => r.TimeSpent);
		var withAiRecords = records.Where(r => r.IsAiUsed).ToList();
		var withoutAiRecords = records.Where(r => !r.IsAiUsed).ToList();
		double totalSavedWithAi = withAiRecords.Sum(r => r.TimeSaved);
		double totalSavedWithoutAi = withoutAiRecords.Sum(r => r.TimeSaved);
		double totalWouldHaveBeen = totalSpent + totalSaved;
		double wouldHaveBeenWithAi = withAiRecords.Sum(r => r.TimeSpent + r.TimeSaved);
		double wouldHaveBeenWithoutAi = withoutAiRecords.Sum(r => r.TimeSpent + r.TimeSaved);
		// When totalWouldHaveBeen <= 0 (e.g. large overruns), percent is not meaningful
		double totalTimeSavedPercent = totalWouldHaveBeen > 0 ? totalSaved / totalWouldHaveBeen * 100.0 : 0;
		double totalTimeSavedPercentWithAi = wouldHaveBeenWithAi > 0 ? totalSavedWithAi / wouldHaveBeenWithAi * 100.0 : 0;
		double totalTimeSavedPercentWithoutAi = wouldHaveBeenWithoutAi > 0 ? totalSavedWithoutAi / wouldHaveBeenWithoutAi * 100.0 : 0;

		int withAi = withAiRecords.Count;
		double tasksWithAiPercent = (double)withAi / records.Count * 100.0;
		var withSaves = withAiRecords.Where(r => r.TimeSaved > 0).ToList();
		var withOverruns = withAiRecords.Where(r => r.TimeSaved < 0).ToList();

		double avgRelativeSavingsOnlySaves = withSaves.Count > 0
			? withSaves.Average(r => (double)r.TimeSaved / (r.TimeSpent + r.TimeSaved) * 100.0)
			: 0;

		double avgRelativeIncreaseOnlyOverruns = withOverruns.Count > 0
			? withOverruns.Average(r => -(double)r.TimeSaved / r.TimeSpent * 100.0)
			: 0;

		var withValidTotal = withAiRecords.Where(r => r.TimeSpent + r.TimeSaved > 0).ToList();
		double avgNetRelativeImpact = withValidTotal.Count > 0
			? withValidTotal.Average(r => (double)r.TimeSaved / (r.TimeSpent + r.TimeSaved) * 100.0)
			: 0;

		// Estimation error: under (took less) vs over (took more), each split by AI usage
		double estimationErrorUnderWithAi = 0, estimationErrorUnderWithoutAi = 0;
		double estimationErrorOverWithAi = 0, estimationErrorOverWithoutAi = 0;
		double sumStoryPoints = records.Sum(r => (byte)r.StoryPoints);
		if (sumStoryPoints > 0 && totalSpent > 0)
		{
			double ratio = totalSpent / sumStoryPoints;
			var underWithAi = new List<double>();
			var underWithoutAi = new List<double>();
			var overWithAi = new List<double>();
			var overWithoutAi = new List<double>();
			foreach (var r in records)
			{
				if (r.TimeSpent == 0) continue;
				double predicted = (byte)r.StoryPoints * ratio;
				if (r.TimeSpent < predicted) // took less
				{
					double underPct = (predicted - r.TimeSpent) / r.TimeSpent * 100.0;
					if (r.IsAiUsed) underWithAi.Add(underPct);
					else underWithoutAi.Add(underPct);
				}
				else if (r.TimeSpent > predicted) // took more
				{
					double overPct = (r.TimeSpent - predicted) / r.TimeSpent * 100.0;
					if (r.IsAiUsed) overWithAi.Add(overPct);
					else overWithoutAi.Add(overPct);
				}
			}
			estimationErrorUnderWithAi = underWithAi.Count > 0 ? underWithAi.Average() : 0;
			estimationErrorUnderWithoutAi = underWithoutAi.Count > 0 ? underWithoutAi.Average() : 0;
			estimationErrorOverWithAi = overWithAi.Count > 0 ? overWithAi.Average() : 0;
			estimationErrorOverWithoutAi = overWithoutAi.Count > 0 ? overWithoutAi.Average() : 0;
		}

		// Assume TimeSpent/TimeSaved are in minutes; convert to hours
		double totalTimeSpentHours = totalSpent / 60.0;
		double totalTimeSavedHours = totalSaved / 60.0;
		double totalTimeSavedHoursWithAi = totalSavedWithAi / 60.0;
		double totalTimeSavedHoursWithoutAi = totalSavedWithoutAi / 60.0;

		return new UsageMetricsDto
		{
			TotalTimeSpent = totalSpent,
			TotalTimeSpentHours = totalTimeSpentHours,
			TotalTimeSaved = totalSaved,
			TotalTimeSavedHours = totalTimeSavedHours,
			TotalTimeSavedWithAi = totalSavedWithAi,
			TotalTimeSavedHoursWithAi = totalTimeSavedHoursWithAi,
			TotalTimeSavedWithoutAi = totalSavedWithoutAi,
			TotalTimeSavedHoursWithoutAi = totalTimeSavedHoursWithoutAi,
			TotalTimeSavedPercentWithAi = totalTimeSavedPercentWithAi,
			TotalTimeSavedPercentWithoutAi = totalTimeSavedPercentWithoutAi,
			TotalTimeSavedPercent = totalTimeSavedPercent,
			TasksWithAiPercent = tasksWithAiPercent,
			AvgRelativeSavingsOnAiTaskOnlySavesPercent = avgRelativeSavingsOnlySaves,
			AvgRelativeIncreaseOnAiTaskOnlyOverrunsPercent = avgRelativeIncreaseOnlyOverruns,
			AvgNetRelativeImpactOnAiTaskPercent = avgNetRelativeImpact,
			EstimationErrorUnderPercentWithAi = estimationErrorUnderWithAi,
			EstimationErrorUnderPercentWithoutAi = estimationErrorUnderWithoutAi,
			EstimationErrorOverPercentWithAi = estimationErrorOverWithAi,
			EstimationErrorOverPercentWithoutAi = estimationErrorOverWithoutAi
		};
	}
}
