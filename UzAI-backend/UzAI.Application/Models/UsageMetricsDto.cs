namespace UzAI.Application.Models;

public class UsageMetricsDto
{
	/// <summary>Total time saved (same unit as TimeSaved in records, e.g. minutes).</summary>
	public double TotalTimeSaved { get; init; }

	/// <summary>Total time saved as hours (TotalTimeSaved / 60).</summary>
	public double TotalTimeSavedHours { get; init; }

	/// <summary>Percentage of total time saved relative to time that would have been spent without savings (TimeSpent + TimeSaved).</summary>
	public double TotalTimeSavedPercent { get; init; }

	/// <summary>Percentage of tasks (records) where AI was used.</summary>
	public double TasksWithAiPercent { get; init; }

	/// <summary>Average relative time saved on tasks where AI was used (saved / (spent + saved) * 100).</summary>
	public double AvgRelativeSavingsWithAiPercent { get; init; }

	/// <summary>Estimation error: average absolute percentage error of story point estimate vs actual time (TimeSpent).</summary>
	public double EstimationErrorPercent { get; init; }
}
