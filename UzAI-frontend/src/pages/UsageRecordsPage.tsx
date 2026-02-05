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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useSprintsWithMetrics } from '../hooks/useUsageWithMetrics';
import {
	UsageTableFilters,
	UsageMetricsTable,
	SprintsTable,
} from '../components/usage';
import { computeMetricsFromRecords } from '../utils/usageMetricsUtils';
import {
	filterRecords,
	initialFilterState,
	type SortColumn,
	type SortOrder,
	type UsageTableFilterState,
} from '../utils/usageTableUtils';
import { downloadUsageReportPdf } from '../utils/usageReportPdf';
import DownloadIcon from '@mui/icons-material/Download';

export default function UsageRecordsPage() {
	const { sprints, loading, error, retry } = useSprintsWithMetrics();
	const [toastOpen, setToastOpen] = useState(false);
	const [orderBy, setOrderBy] = useState<SortColumn>('ticketNumber');
	const [order, setOrder] = useState<SortOrder>('desc');
	const [statsOpen, setStatsOpen] = useState(false);
	const [filterOpen, setFilterOpen] = useState(false);
	const [filter, setFilter] =
		useState<UsageTableFilterState>(initialFilterState);

	const years = useMemo(() => {
		const set = new Set<string>();
		sprints.forEach((s) => {
			const y = s.startDate.slice(0, 4);
			if (y) set.add(y);
		});
		return Array.from(set).sort((a, b) => b.localeCompare(a));
	}, [sprints]);

	const [selectedYear, setSelectedYear] = useState<string | null>(null);
	const effectiveYear = selectedYear ?? years[0] ?? String(new Date().getFullYear());

	const sprintsForYear = useMemo(
		() =>
			sprints.filter((s) => s.startDate.slice(0, 4) === effectiveYear),
		[sprints, effectiveYear]
	);

	const yearIndex = years.indexOf(effectiveYear);
	const hasPrevYear = yearIndex >= 0 && yearIndex < years.length - 1;
	const hasNextYear = yearIndex > 0;

	const handlePrevYear = () => {
		if (hasPrevYear) setSelectedYear(years[yearIndex + 1]);
	};
	const handleNextYear = () => {
		if (hasNextYear) setSelectedYear(years[yearIndex - 1]);
	};

	const allRecords = useMemo(
		() => sprintsForYear.flatMap((s) => s.records),
		[sprintsForYear]
	);
	const filteredAllRecords = useMemo(
		() => filterRecords(allRecords, filter),
		[allRecords, filter]
	);
	const totalMetricsForRange = useMemo(
		() => computeMetricsFromRecords(filteredAllRecords),
		[filteredAllRecords]
	);

	const handleSort = (column: SortColumn) => {
		const isAsc = orderBy === column && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(column);
	};

	const handleDownloadReport = () => {
		downloadUsageReportPdf({
			year: effectiveYear,
			metrics: totalMetricsForRange,
			sprints: sprintsForYear,
			filter,
		});
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
				Usage by Sprints
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
							Total statistics
						</Typography>
					</Stack>
					<Collapse in={statsOpen}>
						<Box sx={{ px: 0, pb: 0 }}>
							<UsageMetricsTable metrics={totalMetricsForRange} />
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

			{!loading && years.length > 0 && (
				<Stack
					direction='row'
					alignItems='center'
					justifyContent='space-between'
					sx={{ mb: 1, px: 0 }}
				>
					<Button
						variant='outlined'
						size='small'
						startIcon={<DownloadIcon />}
						onClick={handleDownloadReport}
					>
						Download report
					</Button>
					<Stack direction='row' alignItems='center' gap={0.5}>
						<Typography variant='body2' color='text.secondary' sx={{ mr: 1 }}>
							Year
						</Typography>
						<IconButton
							size='small'
							onClick={handlePrevYear}
							disabled={!hasPrevYear}
							aria-label='Previous year'
						>
							<ChevronLeftIcon fontSize='small' />
						</IconButton>
						<Typography variant='body2' sx={{ minWidth: 48, textAlign: 'center' }}>
							{effectiveYear}
						</Typography>
						<IconButton
							size='small'
							onClick={handleNextYear}
							disabled={!hasNextYear}
							aria-label='Next year'
						>
							<ChevronRightIcon fontSize='small' />
						</IconButton>
						<Typography variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
							{yearIndex + 1} of {years.length}
						</Typography>
					</Stack>
				</Stack>
			)}

			<SprintsTable
				sprints={sprintsForYear}
				filter={filter}
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
