import { useEffect, useState } from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	CircularProgress,
	Alert,
	Button,
	Snackbar,
} from '@mui/material';
import { fetchUsageRecords, UsageApiError } from '../api/usageApi';
import type { UsageRecord } from '../types/usageRecord';

function formatDate(iso: string) {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function getErrorMessage(err: unknown): string {
	return err instanceof UsageApiError
		? err.message
		: err instanceof Error
		? err.message
		: 'Failed to load usage records';
}

export default function UsageRecordsPage() {
	const [records, setRecords] = useState<UsageRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [toastOpen, setToastOpen] = useState(false);

	const showError = (message: string) => {
		setError(message);
		setToastOpen(true);
	};

	const retry = () => {
		setError(null);
		setLoading(true);
		fetchUsageRecords()
			.then((data) => setRecords(data))
			.catch((err: unknown) => showError(getErrorMessage(err)))
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		fetchUsageRecords()
			.then((data) => {
				if (!cancelled) setRecords(data);
			})
			.catch((err: unknown) => {
				if (!cancelled) showError(getErrorMessage(err));
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<Box sx={{ width: '100%', py: 3 }}>
			{error && (
				<Alert
					severity='error'
					onClose={() => setError(null)}
					action={
						<Button color='inherit' size='small' onClick={retry}>
							Retry
						</Button>
					}
					sx={{ mb: 2 }}
				>
					{error}
				</Alert>
			)}

			<Typography variant='h5' component='h1' gutterBottom>
				Usage Records
			</Typography>
			<TableContainer component={Paper} variant='outlined'>
				<Table size='small' aria-label='Usage records table'>
					<TableHead>
						<TableRow>
							<TableCell>User ID</TableCell>
							<TableCell>Timestamp</TableCell>
							<TableCell>Action</TableCell>
							<TableCell align='right'>Quantity</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={4} align='center' sx={{ py: 4 }}>
									<CircularProgress size={24} />
								</TableCell>
							</TableRow>
						) : records.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align='center' sx={{ py: 4 }}>
									No usage records found.
								</TableCell>
							</TableRow>
						) : (
							records.map((row) => (
								<TableRow key={row.id} hover>
									<TableCell>{row.userId}</TableCell>
									<TableCell>{formatDate(row.timestamp)}</TableCell>
									<TableCell>{row.action ?? '—'}</TableCell>
									<TableCell align='right'>{row.quantity ?? '—'}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Snackbar
				open={toastOpen}
				autoHideDuration={3000}
				onClose={() => setToastOpen(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<Alert
					elevation={6}
					variant='filled'
					severity='error'
					onClose={() => setToastOpen(false)}
					sx={{ maxWidth: 360 }}
				>
					{error}
				</Alert>
			</Snackbar>
		</Box>
	);
}
