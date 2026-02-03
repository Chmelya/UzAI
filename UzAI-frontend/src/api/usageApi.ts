import type { UsageRecord } from '../types/usageRecord';

const API_BASE = '/api';

export class UsageApiError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly detail?: string
	) {
		super(message);
		this.name = 'UsageApiError';
	}
}

export async function fetchUsageRecords(): Promise<UsageRecord[]> {
	let res: Response;
	try {
		res = await fetch(`${API_BASE}/Usage`);
	} catch (err) {
		throw new UsageApiError(
			'Backend not connected. Start the API to load usage records.',
			0
		);
	}

	if (!res.ok) {
		let detail: string | undefined;
		const contentType = res.headers.get('content-type');
		if (contentType?.includes('application/json')) {
			try {
				const body = await res.json();
				detail = body.detail ?? body.message ?? body.title;
			} catch {
				// ignore
			}
		}
		const status = res.status;
		if (status >= 500) {
			throw new UsageApiError(
				'Something went wrong on the server. Please try again later.',
				status,
				detail
			);
		}
		if (status === 404) {
			throw new UsageApiError('Usage API was not found.', status, detail);
		}
		throw new UsageApiError(
			detail ?? `Request failed (${res.status} ${res.statusText}).`,
			status,
			detail
		);
	}

	return res.json();
}
