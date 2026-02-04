import { useMemo, useState } from 'react';
import {
	Box,
	Typography,
	Alert,
	Button,
	Snackbar,
	Paper,
	Stack,
	Collapse,
	IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useUsageWithMetrics } from '../hooks/useUsageWithMetrics';
import {
	UsageTableFilters,
	UsageRecordsTable,
	UsageMetricsTable,
} from '../components/usage';
import { computeMetricsFromRecords } from '../utils/usageMetricsUtils';
import {
	compareRecords,
	filterRecords,
	initialFilterState,
	type SortColumn,
	type SortOrder,
	type UsageTableFilterState,
} from '../utils/usageTableUtils';

export default function UsageRecordsPage() {
	const { records, loading, error, retry } = useUsageWithMetrics();
	const [toastOpen, setToastOpen] = useState(false);
	const [orderBy, setOrderBy] = useState<SortColumn>('timestamp');
	const [order, setOrder] = useState<SortOrder>('desc');
	const [statsOpen, setStatsOpen] = useState(true);
	const [filterOpen, setFilterOpen] = useState(true);
	const [filter, setFilter] =
		useState<UsageTableFilterState>(initialFilterState);

	const sortedRecords = useMemo(
		() => [...records].sort((a, b) => compareRecords(a, b, orderBy, order)),
		[records, orderBy, order]
	);
	const filteredRecords = useMemo(
		() => filterRecords(sortedRecords, filter),
		[sortedRecords, filter]
	);
	const metricsForRange = useMemo(
		() => computeMetricsFromRecords(filteredRecords),
		[filteredRecords]
	);

	const handleSort = (column: SortColumn) => {
		const isAsc = orderBy === column && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(column);
	};

	return (
		<Box sx={{ width: '100%', py: 3 }}>
			{error && (
				<Alert
					severity='error'
					onClose={() => {}}
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

			{!loading && (
				<Paper variant='outlined' sx={{ mb: 2, overflow: 'hidden' }}>
					<Stack
						direction='row'
						alignItems='center'
						onClick={() => setStatsOpen((o) => !o)}
						sx={{
							px: 1.5,
							py: 0.75,
							cursor: 'pointer',
							'&:hover': { bgcolor: 'action.hover' },
						}}
					>
						<IconButton
							size='small'
							onClick={(e) => {
								e.stopPropagation();
								setStatsOpen((o) => !o);
							}}
							aria-label={
								statsOpen ? 'Collapse statistics' : 'Expand statistics'
							}
							sx={{ p: 0.5 }}
						>
							{statsOpen ? (
								<ExpandLessIcon fontSize='small' />
							) : (
								<ExpandMoreIcon fontSize='small' />
							)}
						</IconButton>
						<Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
							Statistics
						</Typography>
					</Stack>
					<Collapse in={statsOpen}>
						<Box sx={{ px: 0, pb: 0 }}>
							<UsageMetricsTable metrics={metricsForRange} />
						</Box>
					</Collapse>
				</Paper>
			)}

			<UsageTableFilters
				open={filterOpen}
				onToggleOpen={() => setFilterOpen((o) => !o)}
				filter={filter}
				onFilterChange={setFilter}
				onClear={() => setFilter(initialFilterState)}
			/>

			<UsageRecordsTable
				records={records}
				filteredRecords={filteredRecords}
				loading={loading}
				orderBy={orderBy}
				order={order}
				onSort={handleSort}
			/>

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
