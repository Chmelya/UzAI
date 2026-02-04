import type { UsageRecord, UsageResponse } from '../types/usageRecord';
import { STORY_POINTS_VALUES } from '../types/usageRecord';
import { computeMetricsFromRecords } from '../utils/usageMetricsUtils';

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBool(probability = 0.5): boolean {
	return Math.random() < probability;
}

function pickStoryPoints(): (typeof STORY_POINTS_VALUES)[number] {
	return STORY_POINTS_VALUES[randomInt(0, STORY_POINTS_VALUES.length - 1)];
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
		const storyPoints = pickStoryPoints();
		const idx = STORY_POINTS_VALUES.indexOf(storyPoints);
		const newIdx = Math.max(
			0,
			Math.min(STORY_POINTS_VALUES.length - 1, idx + randomInt(-2, 2))
		);
		const newStoryPoints = STORY_POINTS_VALUES[newIdx];
		const isAiUsed = randomBool(0.6);
		const timeSpent = randomInt(15, 240);
		// Time saved can be negative (overrun); with AI often positive, without AI often zero or negative
		const timeSaved = isAiUsed
			? randomInt(-15, Math.min(120, timeSpent))
			: randomInt(-45, 5);

		records.push({
			id: i + 1,
			timestamp: isoDate(
				new Date(
					now - i * dayMs * randomInt(0, 3) - randomInt(0, 23 * 60 * 60 * 1000)
				)
			),
			storyPoints,
			newStoryPoints,
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
