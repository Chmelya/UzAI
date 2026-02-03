import type { UsageRecord } from '../types/usageRecord';

export type SortColumn = keyof Pick<
	UsageRecord,
	| 'timestamp'
	| 'storyPoints'
	| 'newStoryPoints'
	| 'isAiUsed'
	| 'timeSpent'
	| 'timeSaved'
>;
export type SortOrder = 'asc' | 'desc';

export function compareRecords(
	a: UsageRecord,
	b: UsageRecord,
	orderBy: SortColumn,
	order: SortOrder
): number {
	const aVal = a[orderBy];
	const bVal = b[orderBy];
	let cmp = 0;
	if (typeof aVal === 'string' && typeof bVal === 'string') {
		cmp = aVal.localeCompare(bVal);
	} else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
		cmp = (aVal ? 1 : 0) - (bVal ? 1 : 0);
	} else if (typeof aVal === 'number' && typeof bVal === 'number') {
		cmp = aVal - bVal;
	}
	return order === 'asc' ? cmp : -cmp;
}

export interface UsageTableFilterState {
	aiUsed: 'all' | 'yes' | 'no';
	dateFrom: string;
	dateTo: string;
	storyPointsMin: string;
	storyPointsMax: string;
	timeSpentMin: string;
	timeSpentMax: string;
	timeSavedMin: string;
	timeSavedMax: string;
}

export function filterRecords(
	records: UsageRecord[],
	filter: UsageTableFilterState
): UsageRecord[] {
	return records.filter((row) => {
		if (filter.aiUsed === 'yes' && !row.isAiUsed) return false;
		if (filter.aiUsed === 'no' && row.isAiUsed) return false;
		const rowDate = row.timestamp.slice(0, 10);
		if (filter.dateFrom !== '' && rowDate < filter.dateFrom) return false;
		if (filter.dateTo !== '' && rowDate > filter.dateTo) return false;
		const spMin =
			filter.storyPointsMin === '' ? -Infinity : Number(filter.storyPointsMin);
		const spMax =
			filter.storyPointsMax === '' ? Infinity : Number(filter.storyPointsMax);
		if (row.storyPoints < spMin || row.storyPoints > spMax) return false;
		const tsMin =
			filter.timeSpentMin === '' ? -Infinity : Number(filter.timeSpentMin);
		const tsMax =
			filter.timeSpentMax === '' ? Infinity : Number(filter.timeSpentMax);
		if (row.timeSpent < tsMin || row.timeSpent > tsMax) return false;
		const savedMin =
			filter.timeSavedMin === '' ? -Infinity : Number(filter.timeSavedMin);
		const savedMax =
			filter.timeSavedMax === '' ? Infinity : Number(filter.timeSavedMax);
		if (row.timeSaved < savedMin || row.timeSaved > savedMax) return false;
		return true;
	});
}

export const initialFilterState: UsageTableFilterState = {
	aiUsed: 'all',
	dateFrom: '',
	dateTo: '',
	storyPointsMin: '',
	storyPointsMax: '',
	timeSpentMin: '',
	timeSpentMax: '',
	timeSavedMin: '',
	timeSavedMax: '',
};

export function hasActiveFilters(filter: UsageTableFilterState): boolean {
	return (
		filter.aiUsed !== 'all' ||
		filter.dateFrom !== '' ||
		filter.dateTo !== '' ||
		filter.storyPointsMin !== '' ||
		filter.storyPointsMax !== '' ||
		filter.timeSpentMin !== '' ||
		filter.timeSpentMax !== '' ||
		filter.timeSavedMin !== '' ||
		filter.timeSavedMax !== ''
	);
}
