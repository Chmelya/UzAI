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

	/// <summary>Average relative savings on AI tasks that had time saved (timeSaved &gt; 0): saved / (spent + saved) * 100.</summary>
	public double AvgRelativeSavingsOnAiTaskOnlySavesPercent { get; init; }

	/// <summary>Average relative increase in time on AI tasks that had overruns (timeSaved &lt; 0): |timeSaved| / timeSpent * 100.</summary>
	public double AvgRelativeIncreaseOnAiTaskOnlyOverrunsPercent { get; init; }

	/// <summary>Average net relative impact on AI tasks (savings and overruns): saved / (spent + saved) * 100 per task, averaged.</summary>
	public double AvgNetRelativeImpactOnAiTaskPercent { get; init; }

	/// <summary>Estimation error: average absolute percentage error of story point estimate vs actual time (TimeSpent).</summary>
	public double EstimationErrorPercent { get; init; }
}
