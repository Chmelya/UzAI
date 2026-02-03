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
				TotalTimeSaved = 0,
				TotalTimeSavedHours = 0,
				TotalTimeSavedPercent = 0,
				TasksWithAiPercent = 0,
				AvgRelativeSavingsWithAiPercent = 0,
				EstimationErrorPercent = 0
			};

		double totalSaved = records.Sum(r => r.TimeSaved);
		double totalSpent = records.Sum(r => r.TimeSpent);
		double totalWouldHaveBeen = totalSpent + totalSaved;
		double totalTimeSavedPercent = totalWouldHaveBeen > 0 ? totalSaved / totalWouldHaveBeen * 100.0 : 0;

		int withAi = records.Count(r => r.IsAiUsed);
		double tasksWithAiPercent = (double)withAi / records.Count * 100.0;

		var withAiRecords = records.Where(r => r.IsAiUsed).ToList();
		double avgRelativeSavingsWithAiPercent = 0;
		if (withAiRecords.Count > 0)
		{
			double sumPercent = 0;
			foreach (var r in withAiRecords)
			{
				double totalTime = r.TimeSpent + r.TimeSaved;
				if (totalTime > 0)
					sumPercent += (double)r.TimeSaved / totalTime * 100.0;
			}
			avgRelativeSavingsWithAiPercent = sumPercent / withAiRecords.Count;
		}

		// Estimation error: MAPE of StoryPoints vs actual time (scale story points to time by global ratio)
		double estimationErrorPercent = 0;
		double sumStoryPoints = records.Sum(r => (byte)r.StoryPoints);
		if (sumStoryPoints > 0 && totalSpent > 0)
		{
			double ratio = totalSpent / sumStoryPoints;
			double sumApe = 0;
			int count = 0;
			foreach (var r in records)
			{
				if (r.TimeSpent == 0) continue;
				double predicted = (byte)r.StoryPoints * ratio;
				sumApe += Math.Abs(r.TimeSpent - predicted) / r.TimeSpent * 100.0;
				count++;
			}
			estimationErrorPercent = count > 0 ? sumApe / count : 0;
		}

		// Assume TimeSpent/TimeSaved are in minutes; convert total saved to hours
		double totalTimeSavedHours = totalSaved / 60.0;

		return new UsageMetricsDto
		{
			TotalTimeSaved = totalSaved,
			TotalTimeSavedHours = totalTimeSavedHours,
			TotalTimeSavedPercent = totalTimeSavedPercent,
			TasksWithAiPercent = tasksWithAiPercent,
			AvgRelativeSavingsWithAiPercent = avgRelativeSavingsWithAiPercent,
			EstimationErrorPercent = estimationErrorPercent
		};
	}
}
