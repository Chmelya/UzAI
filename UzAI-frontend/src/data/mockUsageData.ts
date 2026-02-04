import type { UsageRecord, UsageResponse, Sprint } from '../types/usageRecord';
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

function dateOnly(d: Date): string {
	return d.toISOString().slice(0, 10);
}

const MINUTES_PER_HOUR = 60;
const HOURS_PER_STORY_POINT = 8;
const VARIANCE_HOURS = 3;
const VARIANCE_MINUTES = VARIANCE_HOURS * MINUTES_PER_HOUR; // ±3 hours
const TIME_SAVED_MAX_NEGATIVE_HOURS = 2.5; // overrun cap
const TIME_SAVED_MAX_POSITIVE_HOURS = 6;
const TIME_SAVED_MIN_MINUTES = -Math.round(
	TIME_SAVED_MAX_NEGATIVE_HOURS * MINUTES_PER_HOUR
); // -150
const TIME_SAVED_MAX_MINUTES = Math.round(
	TIME_SAVED_MAX_POSITIVE_HOURS * MINUTES_PER_HOUR
); // 360
const SPRINT_DAYS = 14;

const MOCK_EMPLOYEES: { name: string; surname: string }[] = [
	{ name: 'Anna', surname: 'Smith' },
	{ name: 'John', surname: 'Doe' },
	{ name: 'Maria', surname: 'Garcia' },
	{ name: 'James', surname: 'Wilson' },
	{ name: 'Elena', surname: 'Kowalski' },
	{ name: 'David', surname: 'Brown' },
];

/** First Wednesday of September 2025 (UTC). */
function getFirstSprintStart(): Date {
	const d = new Date(Date.UTC(2025, 8, 1)); // Sept 1, 2025
	const day = d.getUTCDay(); // 0 Sun .. 6 Sat
	const wednesdayOffset = day <= 3 ? 3 - day : 10 - day; // days until next Wed
	d.setUTCDate(d.getUTCDate() + wednesdayOffset);
	return d;
}

/** Start date of sprint index (0-based). Each sprint is 2 weeks from Wednesday. */
function getSprintStart(sprintIndex: number): Date {
	const first = getFirstSprintStart();
	const d = new Date(first);
	d.setUTCDate(d.getUTCDate() + sprintIndex * SPRINT_DAYS);
	return d;
}

/** Generates one usage record with a given timestamp. */
function generateRecord(
	id: number,
	timestamp: Date
): Omit<UsageRecord, 'id'> & { id: number } {
	const storyPoints = pickStoryPoints();
	const idx = STORY_POINTS_VALUES.indexOf(storyPoints);
	const newIdx = Math.max(
		0,
		Math.min(STORY_POINTS_VALUES.length - 1, idx + randomInt(-2, 2))
	);
	const newStoryPoints = STORY_POINTS_VALUES[newIdx];
	const isAiUsed = randomBool(0.6);
	const baseMinutes = HOURS_PER_STORY_POINT * MINUTES_PER_HOUR * newStoryPoints;
	const timeSpent = Math.max(
		1,
		baseMinutes + randomInt(-VARIANCE_MINUTES, VARIANCE_MINUTES)
	);
	const timeSaved = isAiUsed
		? randomInt(TIME_SAVED_MIN_MINUTES, TIME_SAVED_MAX_MINUTES)
		: 0;
	const ticketNumber = String(id).padStart(5, '0');
	const employee = MOCK_EMPLOYEES[randomInt(0, MOCK_EMPLOYEES.length - 1)];
	return {
		id,
		ticketNumber,
		employeeName: employee.name,
		employeeSurname: employee.surname,
		timestamp: isoDate(timestamp),
		storyPoints,
		newStoryPoints,
		isAiUsed,
		timeSpent,
		timeSaved,
	};
}

/** Generates 50 mock usage records with varied, realistic-looking data. */
export function generateMockUsageRecords(): UsageRecord[] {
	const records: UsageRecord[] = [];
	const now = Date.now();
	const dayMs = 24 * 60 * 60 * 1000;

	for (let i = 0; i < 50; i++) {
		const ts = new Date(
			now - i * dayMs * randomInt(0, 3) - randomInt(0, 23 * 60 * 60 * 1000)
		);
		records.push(generateRecord(i + 1, ts));
	}

	return records.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);
}

/** Sprint name: 2025.15, 2025.16, ... then 2026.1, 2026.2, ... when year changes to 2026. */
function getSprintName(
	startDate: Date,
	year2025Num: { value: number },
	year2026Num: { value: number }
): string {
	const year = startDate.getUTCFullYear();
	if (year === 2025) {
		return `2025.${year2025Num.value++}`;
	}
	return `2026.${++year2026Num.value}`;
}

/** Generates mock sprints: first 2025.15 (first Wed Sept 2025), then 2026.1 in 2026; last sprint starts Feb and ends Mar. */
export function generateMockSprintsWithRecords(): Sprint[] {
	const sprints: Sprint[] = [];
	const dayMs = 24 * 60 * 60 * 1000;
	let recordId = 1;
	const year2025Num = { value: 15 };
	const year2026Num = { value: 0 };

	for (let s = 0; ; s++) {
		const startDate = getSprintStart(s);
		const endDate = new Date(startDate.getTime() + (SPRINT_DAYS - 1) * dayMs);
		const records: UsageRecord[] = [];
		const count = randomInt(8, 14);
		for (let i = 0; i < count; i++) {
			const dayOffset = randomInt(0, SPRINT_DAYS - 1);
			const hourOffset = randomInt(0, 23) * 60 * 60 * 1000;
			const timestamp = new Date(
				startDate.getTime() + dayOffset * dayMs + hourOffset
			);
			records.push(generateRecord(recordId++, timestamp));
		}
		records.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
		sprints.push({
			id: s + 1,
			name: getSprintName(startDate, year2025Num, year2026Num),
			startDate: dateOnly(startDate),
			endDate: dateOnly(endDate),
			capacity: randomInt(75, 85), // 80 ± 5 story points
			records,
		});
		// Stop when last sprint starts in February and ends in March (UTC months: 1 = Feb, 2 = Mar)
		if (startDate.getUTCMonth() === 1 && endDate.getUTCMonth() === 2) {
			break;
		}
	}

	return sprints.sort(
		(a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
	);
}

const cachedSprints = generateMockSprintsWithRecords();
const cachedRecords = cachedSprints.flatMap((s) => s.records);
const cachedMetrics = computeMetricsFromRecords(cachedRecords);

/** Mock response: sprints with nested records (for sprint-based UI). */
export function getMockSprintsWithRecords(): {
	sprints: Sprint[];
	totalMetrics: ReturnType<typeof computeMetricsFromRecords>;
} {
	return {
		sprints: cachedSprints,
		totalMetrics: cachedMetrics,
	};
}

/** Temporary mock response: 50 records + computed metrics (legacy / API fallback). */
export function getMockUsageResponse(): UsageResponse {
	return {
		records: cachedRecords,
		metrics: cachedMetrics,
	};
}
