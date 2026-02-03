import type { UsageRecord, UsageMetrics } from '../types/usageRecord';

/** Computes metrics from a list of records (same logic as backend). */
export function computeMetricsFromRecords(
	records: UsageRecord[]
): UsageMetrics {
	if (records.length === 0) {
		return {
			totalTimeSaved: 0,
			totalTimeSavedHours: 0,
			totalTimeSavedPercent: 0,
			tasksWithAiPercent: 0,
			avgRelativeSavingsWithAiPercent: 0,
			estimationErrorPercent: 0,
		};
	}

	const totalSaved = records.reduce((s, r) => s + r.timeSaved, 0);
	const totalSpent = records.reduce((s, r) => s + r.timeSpent, 0);
	const totalWouldHaveBeen = totalSpent + totalSaved;
	const totalTimeSavedPercent =
		totalWouldHaveBeen > 0 ? (totalSaved / totalWouldHaveBeen) * 100 : 0;

	const withAi = records.filter((r) => r.isAiUsed);
	const tasksWithAiPercent = (withAi.length / records.length) * 100;

	let avgRelativeSavingsWithAiPercent = 0;
	if (withAi.length > 0) {
		const sumPercent = withAi.reduce((s, r) => {
			const total = r.timeSpent + r.timeSaved;
			return s + (total > 0 ? (r.timeSaved / total) * 100 : 0);
		}, 0);
		avgRelativeSavingsWithAiPercent = sumPercent / withAi.length;
	}

	const sumStoryPoints = records.reduce((s, r) => s + r.storyPointsByte, 0);
	let estimationErrorPercent = 0;
	if (sumStoryPoints > 0 && totalSpent > 0) {
		const ratio = totalSpent / sumStoryPoints;
		let sumApe = 0;
		let count = 0;
		for (const r of records) {
			if (r.timeSpent === 0) continue;
			const predicted = r.storyPointsByte * ratio;
			sumApe += (Math.abs(r.timeSpent - predicted) / r.timeSpent) * 100;
			count++;
		}
		estimationErrorPercent = count > 0 ? sumApe / count : 0;
	}

	return {
		totalTimeSaved: totalSaved,
		totalTimeSavedHours: totalSaved / 60,
		totalTimeSavedPercent,
		tasksWithAiPercent,
		avgRelativeSavingsWithAiPercent,
		estimationErrorPercent,
	};
}
