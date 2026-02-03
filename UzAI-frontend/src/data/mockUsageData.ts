import type { UsageRecord, UsageResponse } from '../types/usageRecord';
import { computeMetricsFromRecords } from '../utils/usageMetricsUtils';

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBool(probability = 0.5): boolean {
	return Math.random() < probability;
}

function isoDate(d: Date): string {
	return d.toISOString();
}

/** Generates 50 mock usage records with varied, realistic-looking data. */
export function generateMockUsageRecords(): UsageRecord[] {
	const records: UsageRecord[] = [];
	const now = Date.now();
	const dayMs = 24 * 60 * 60 * 1000;

	for (let i = 0; i < 50; i++) {
		const storyPoints = randomInt(1, 8);
		const newStoryPoints = Math.max(1, storyPoints + randomInt(-2, 2));
		const isAiUsed = randomBool(0.6);
		const timeSpent = randomInt(15, 240);
		const timeSaved = isAiUsed ? randomInt(5, Math.min(120, timeSpent)) : 0;

		records.push({
			id: i + 1,
			timestamp: isoDate(
				new Date(
					now - i * dayMs * randomInt(0, 3) - randomInt(0, 23 * 60 * 60 * 1000)
				)
			),
			storyPointsByte: storyPoints,
			newStoryPointsByte: newStoryPoints,
			isAiUsed,
			timeSpent,
			timeSaved,
		});
	}

	return records.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);
}

const cachedRecords = generateMockUsageRecords();
const cachedMetrics = computeMetricsFromRecords(cachedRecords);

/** Temporary mock response: 50 records + computed metrics. */
export function getMockUsageResponse(): UsageResponse {
	return {
		records: cachedRecords,
		metrics: cachedMetrics,
	};
}
