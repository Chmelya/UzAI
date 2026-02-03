import { useEffect, useState } from 'react';
import { fetchUsageWithMetrics } from '../api/usageApi';
import { getMockUsageResponse } from '../data/mockUsageData';
import type { UsageRecord, UsageMetrics } from '../types/usageRecord';

export function useUsageWithMetrics() {
	const [records, setRecords] = useState<UsageRecord[]>([]);
	const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = () => {
		setError(null);
		setLoading(true);
		fetchUsageWithMetrics()
			.then((data) => {
				setRecords(data.records);
				setMetrics(data.metrics);
			})
			.catch(() => {
				const mock = getMockUsageResponse();
				setRecords(mock.records);
				setMetrics(mock.metrics);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	return { records, metrics, loading, error, retry: load };
}
