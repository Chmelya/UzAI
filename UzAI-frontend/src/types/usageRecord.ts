export interface UsageRecord {
	id: number;
	timestamp: string;
	storyPointsByte: number;
	newStoryPointsByte: number;
	isAiUsed: boolean;
	timeSpent: number;
	timeSaved: number;
}
