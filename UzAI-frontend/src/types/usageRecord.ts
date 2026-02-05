/** Allowed story point values (planning scale). */
export const STORY_POINTS_VALUES = [1, 2, 3, 5, 8, 13] as const;
export type StoryPoints = (typeof STORY_POINTS_VALUES)[number];

export interface UsageRecord {
	id: number;
	/** Ticket number (e.g. 12345). */
	ticketNumber: string;
	/** High-level ticket category (matches backend TicketCategory enum). */
	category: number;
	employeeName: string;
	employeeSurname: string;
	timestamp: string;
	storyPoints: StoryPoints;
	newStoryPoints: StoryPoints;
	isAiUsed: boolean;
	timeSpent: number;
	timeSaved: number;
}

export interface UsageMetrics {
	totalTimeSpent: number;
	totalTimeSpentHours: number;
	totalTimeSaved: number;
	totalTimeSavedHours: number;
	totalTimeSavedWithAi: number;
	totalTimeSavedHoursWithAi: number;
	totalTimeSavedWithoutAi: number;
	totalTimeSavedHoursWithoutAi: number;
	totalTimeSavedPercentWithAi: number;
	totalTimeSavedPercentWithoutAi: number;
	totalTimeSavedPercent: number;
	tasksWithAiPercent: number;
	avgRelativeSavingsOnAiTaskOnlySavesPercent: number;
	avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent: number;
	avgNetRelativeImpactOnAiTaskPercent: number;
}

export interface UsageResponse {
	records: UsageRecord[];
	metrics: UsageMetrics;
}

export interface Sprint {
	id: number;
	name: string;
	startDate: string;
	endDate: string;
	/** Planned capacity in story points (e.g. 80 ± 5). */
	capacity: number;
	records: UsageRecord[];
}
