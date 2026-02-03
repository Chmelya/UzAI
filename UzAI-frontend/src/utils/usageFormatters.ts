export function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

export function formatMetric(value: number, decimals = 1): string {
	return value.toFixed(decimals);
}
