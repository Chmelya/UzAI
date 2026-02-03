export interface UsageRecord {
	id: number;
	timestamp: string;
	storyPointsByte: number;
	newStoryPointsByte: number;
	isAiUsed: boolean;
	timeSpent: number;
	timeSaved: number;
}

export interface UsageMetrics {
	totalTimeSaved: number;
	totalTimeSavedHours: number;
	totalTimeSavedPercent: number;
	tasksWithAiPercent: number;
	avgRelativeSavingsWithAiPercent: number;
	estimationErrorPercent: number;
}

export interface UsageResponse {
	records: UsageRecord[];
	metrics: UsageMetrics;
}
