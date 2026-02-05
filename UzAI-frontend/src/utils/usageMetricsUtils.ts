import type { UsageRecord, UsageMetrics } from '../types/usageRecord';

/** Computes metrics from a list of records (same logic as backend). */
export function computeMetricsFromRecords(
	records: UsageRecord[]
): UsageMetrics {
	if (records.length === 0) {
		return {
			totalTimeSpent: 0,
			totalTimeSpentHours: 0,
			totalTimeSaved: 0,
			totalTimeSavedHours: 0,
			totalTimeSavedWithAi: 0,
			totalTimeSavedHoursWithAi: 0,
			totalTimeSavedWithoutAi: 0,
			totalTimeSavedHoursWithoutAi: 0,
			totalTimeSavedPercentWithAi: 0,
			totalTimeSavedPercentWithoutAi: 0,
			totalTimeSavedPercent: 0,
			tasksWithAiPercent: 0,
			avgRelativeSavingsOnAiTaskOnlySavesPercent: 0,
			avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent: 0,
			avgNetRelativeImpactOnAiTaskPercent: 0,
		};
	}

	const totalSaved = records.reduce((s, r) => s + r.timeSaved, 0);
	const totalSpent = records.reduce((s, r) => s + r.timeSpent, 0);
	const totalSavedWithAi = records
		.filter((r) => r.isAiUsed)
		.reduce((s, r) => s + r.timeSaved, 0);
	const totalSavedWithoutAi = records
		.filter((r) => !r.isAiUsed)
		.reduce((s, r) => s + r.timeSaved, 0);
	const totalWouldHaveBeen = totalSpent + totalSaved;
	const wouldHaveBeenWithAi = records
		.filter((r) => r.isAiUsed)
		.reduce((s, r) => s + r.timeSpent + r.timeSaved, 0);
	const wouldHaveBeenWithoutAi = records
		.filter((r) => !r.isAiUsed)
		.reduce((s, r) => s + r.timeSpent + r.timeSaved, 0);
	const totalTimeSavedPercent =
		totalWouldHaveBeen > 0 ? (totalSaved / totalWouldHaveBeen) * 100 : 0;
	const totalTimeSavedPercentWithAi =
		wouldHaveBeenWithAi > 0
			? (totalSavedWithAi / wouldHaveBeenWithAi) * 100
			: 0;
	const totalTimeSavedPercentWithoutAi =
		wouldHaveBeenWithoutAi > 0
			? (totalSavedWithoutAi / wouldHaveBeenWithoutAi) * 100
			: 0;

	const withAi = records.filter((r) => r.isAiUsed);
	const tasksWithAiPercent = (withAi.length / records.length) * 100;

	const withSaves = withAi.filter((r) => r.timeSaved > 0);
	const withOverruns = withAi.filter((r) => r.timeSaved < 0);
	const withValidTotal = withAi.filter((r) => r.timeSpent + r.timeSaved > 0);

	const avgRelativeSavingsOnAiTaskOnlySavesPercent =
		withSaves.length > 0
			? withSaves.reduce(
					(s, r) => s + (r.timeSaved / (r.timeSpent + r.timeSaved)) * 100,
					0
			  ) / withSaves.length
			: 0;

	const avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent =
		withOverruns.length > 0
			? withOverruns.reduce(
					(s, r) => s + (-r.timeSaved / r.timeSpent) * 100,
					0
			  ) / withOverruns.length
			: 0;

	const avgNetRelativeImpactOnAiTaskPercent =
		withValidTotal.length > 0
			? withValidTotal.reduce(
					(s, r) => s + (r.timeSaved / (r.timeSpent + r.timeSaved)) * 100,
					0
			  ) / withValidTotal.length
			: 0;

	return {
		totalTimeSpent: totalSpent,
		totalTimeSpentHours: totalSpent / 60,
		totalTimeSaved: totalSaved,
		totalTimeSavedHours: totalSaved / 60,
		totalTimeSavedWithAi: totalSavedWithAi,
		totalTimeSavedHoursWithAi: totalSavedWithAi / 60,
		totalTimeSavedWithoutAi: totalSavedWithoutAi,
		totalTimeSavedHoursWithoutAi: totalSavedWithoutAi / 60,
		totalTimeSavedPercentWithAi: totalTimeSavedPercentWithAi,
		totalTimeSavedPercentWithoutAi: totalTimeSavedPercentWithoutAi,
		totalTimeSavedPercent,
		tasksWithAiPercent,
		avgRelativeSavingsOnAiTaskOnlySavesPercent,
		avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent,
		avgNetRelativeImpactOnAiTaskPercent,
	};
}
