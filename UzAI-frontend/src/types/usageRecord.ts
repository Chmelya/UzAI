export interface UsageRecord {
	id: string;
	userId: string;
	timestamp: string;
	action: string | null;
	quantity: number | null;
}
