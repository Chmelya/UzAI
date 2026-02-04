/** Allowed story point values (planning scale). */
export const STORY_POINTS_VALUES = [1, 2, 3, 5, 8, 13, 25] as const;
export type StoryPoints = (typeof STORY_POINTS_VALUES)[number];

export interface UsageRecord {
	id: number;
	timestamp: string;
	storyPoints: StoryPoints;
	newStoryPoints: StoryPoints;
	isAiUsed: boolean;
	timeSpent: number;
	timeSaved: number;
}

export interface UsageMetrics {
	totalTimeSaved: number;
	totalTimeSavedHours: number;
	totalTimeSavedPercent: number;
	tasksWithAiPercent: number;
	avgRelativeSavingsOnAiTaskOnlySavesPercent: number;
	avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent: number;
	avgNetRelativeImpactOnAiTaskPercent: number;
	estimationErrorPercent: number;
}

export interface UsageResponse {
	records: UsageRecord[];
	metrics: UsageMetrics;
}
