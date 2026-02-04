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
			estimationErrorUnderPercentWithAi: 0,
			estimationErrorUnderPercentWithoutAi: 0,
			estimationErrorOverPercentWithAi: 0,
			estimationErrorOverPercentWithoutAi: 0,
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

	const sumStoryPoints = records.reduce((s, r) => s + r.storyPoints, 0);
	let estimationErrorUnderWithAi = 0,
		estimationErrorUnderWithoutAi = 0,
		estimationErrorOverWithAi = 0,
		estimationErrorOverWithoutAi = 0;
	if (sumStoryPoints > 0 && totalSpent > 0) {
		const ratio = totalSpent / sumStoryPoints;
		const underWithAi: number[] = [];
		const underWithoutAi: number[] = [];
		const overWithAi: number[] = [];
		const overWithoutAi: number[] = [];
		for (const r of records) {
			if (r.timeSpent === 0) continue;
			const predicted = r.storyPoints * ratio;
			if (r.timeSpent < predicted) {
				const underPct = ((predicted - r.timeSpent) / r.timeSpent) * 100;
				if (r.isAiUsed) underWithAi.push(underPct);
				else underWithoutAi.push(underPct);
			} else if (r.timeSpent > predicted) {
				const overPct = ((r.timeSpent - predicted) / r.timeSpent) * 100;
				if (r.isAiUsed) overWithAi.push(overPct);
				else overWithoutAi.push(overPct);
			}
		}
		estimationErrorUnderWithAi =
			underWithAi.length > 0
				? underWithAi.reduce((a, b) => a + b, 0) / underWithAi.length
				: 0;
		estimationErrorUnderWithoutAi =
			underWithoutAi.length > 0
				? underWithoutAi.reduce((a, b) => a + b, 0) / underWithoutAi.length
				: 0;
		estimationErrorOverWithAi =
			overWithAi.length > 0
				? overWithAi.reduce((a, b) => a + b, 0) / overWithAi.length
				: 0;
		estimationErrorOverWithoutAi =
			overWithoutAi.length > 0
				? overWithoutAi.reduce((a, b) => a + b, 0) / overWithoutAi.length
				: 0;
	}

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
		estimationErrorUnderPercentWithAi: estimationErrorUnderWithAi,
		estimationErrorUnderPercentWithoutAi: estimationErrorUnderWithoutAi,
		estimationErrorOverPercentWithAi: estimationErrorOverWithAi,
		estimationErrorOverPercentWithoutAi: estimationErrorOverWithoutAi,
	};
}
