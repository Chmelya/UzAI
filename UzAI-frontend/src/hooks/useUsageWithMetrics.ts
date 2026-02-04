import { useEffect, useState } from 'react';
import { fetchUsageWithMetrics } from '../api/usageApi';
import {
	getMockUsageResponse,
	getMockSprintsWithRecords,
} from '../data/mockUsageData';
import type { UsageRecord, UsageMetrics, Sprint } from '../types/usageRecord';
import { computeMetricsFromRecords } from '../utils/usageMetricsUtils';

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

export function useSprintsWithMetrics() {
	const [sprints, setSprints] = useState<Sprint[]>([]);
	const [totalMetrics, setTotalMetrics] = useState<ReturnType<
		typeof computeMetricsFromRecords
	> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = () => {
		setError(null);
		setLoading(true);
		// When backend has sprint API, fetch here; for now use mock
		Promise.resolve()
			.then(() => {
				const mock = getMockSprintsWithRecords();
				setSprints(mock.sprints);
				setTotalMetrics(mock.totalMetrics);
			})
			.catch((err) => {
				setError(err instanceof Error ? err.message : 'Failed to load sprints');
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		load();
	}, []);

	return { sprints, totalMetrics, loading, error, retry: load };
}
