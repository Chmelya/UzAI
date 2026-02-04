import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Collapse,
	Box,
	CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { formatDateOnly } from '../../utils/usageFormatters';
import type { Sprint } from '../../types/usageRecord';
import type { UsageMetrics } from '../../types/usageRecord';
import {
	filterRecords,
	compareRecords,
	type SortColumn,
	type SortOrder,
	type UsageTableFilterState,
} from '../../utils/usageTableUtils';
import { computeMetricsFromRecords } from '../../utils/usageMetricsUtils';
import { UsageMetricsTable } from './UsageMetricsTable';
import { UsageRecordsTable } from './UsageRecordsTable';
import { useState, useMemo } from 'react';

interface SprintsTableProps {
	sprints: Sprint[];
	filter: UsageTableFilterState;
	loading: boolean;
	orderBy: SortColumn;
	order: SortOrder;
	onSort: (column: SortColumn) => void;
}

export function SprintsTable({
	sprints,
	filter,
	loading,
	orderBy,
	order,
	onSort,
}: SprintsTableProps) {
	const [expandedId, setExpandedId] = useState<number | null>(null);

	return (
		<TableContainer component={Paper} variant='outlined'>
			<Table size='small' aria-label='Sprints table'>
				<TableHead>
					<TableRow>
						<TableCell
							padding='checkbox'
							sx={{ width: 48, borderBottom: 'none' }}
						/>
						<TableCell sx={{ borderBottom: 'none' }}>Sprint</TableCell>
						<TableCell sx={{ borderBottom: 'none' }}>Start date</TableCell>
						<TableCell sx={{ borderBottom: 'none' }}>End date</TableCell>
						<TableCell align='right' sx={{ borderBottom: 'none' }}>
							Capacity
						</TableCell>
						<TableCell align='right' sx={{ borderBottom: 'none' }}>
							Actual capacity
						</TableCell>
					</TableRow>
					{/* Line only under first 4 columns */}
					<TableRow
						sx={{
							'& td': { border: 'none', borderBottom: 'none', padding: 0 },
						}}
					>
						<TableCell
							colSpan={4}
							sx={{
								padding: 0,
								height: 2,
								border: 'none',
								borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
								verticalAlign: 'top',
							}}
						/>
						<TableCell colSpan={2} sx={{ padding: 0, border: 'none' }} />
					</TableRow>
				</TableHead>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={6} align='center' sx={{ py: 4 }}>
								<CircularProgress size={24} />
							</TableCell>
						</TableRow>
					) : sprints.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} align='center' sx={{ py: 4 }}>
								No sprints found.
							</TableCell>
						</TableRow>
					) : (
						sprints.map((sprint) => (
							<SprintRow
								key={sprint.id}
								sprint={sprint}
								filter={filter}
								orderBy={orderBy}
								order={order}
								onSort={onSort}
								expanded={expandedId === sprint.id}
								onToggleExpand={() =>
									setExpandedId((id) => (id === sprint.id ? null : sprint.id))
								}
							/>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

interface SprintRowProps {
	sprint: Sprint;
	filter: UsageTableFilterState;
	orderBy: SortColumn;
	order: SortOrder;
	onSort: (column: SortColumn) => void;
	expanded: boolean;
	onToggleExpand: () => void;
}

function SprintRow({
	sprint,
	filter,
	orderBy,
	order,
	onSort,
	expanded,
	onToggleExpand,
}: SprintRowProps) {
	const filteredRecords = useMemo(
		() => filterRecords(sprint.records, filter),
		[sprint.records, filter]
	);
	const sortedRecords = useMemo(
		() =>
			[...filteredRecords].sort((a, b) => compareRecords(a, b, orderBy, order)),
		[filteredRecords, orderBy, order]
	);
	const sprintMetrics: UsageMetrics = useMemo(
		() => computeMetricsFromRecords(filteredRecords),
		[filteredRecords]
	);

	return (
		<>
			<TableRow hover>
				<TableCell
					padding='checkbox'
					sx={{
						borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
					}}
				>
					<IconButton
						size='small'
						onClick={onToggleExpand}
						aria-label={expanded ? 'Collapse sprint' : 'Expand sprint'}
					>
						{expanded ? (
							<ExpandLessIcon fontSize='small' />
						) : (
							<ExpandMoreIcon fontSize='small' />
						)}
					</IconButton>
				</TableCell>
				<TableCell
					sx={{
						borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
					}}
				>
					{sprint.name}
				</TableCell>
				<TableCell
					sx={{
						borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
					}}
				>
					{formatDateOnly(sprint.startDate)}
				</TableCell>
				<TableCell
					sx={{
						borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
					}}
				>
					{formatDateOnly(sprint.endDate)}
				</TableCell>
				<TableCell align='right' sx={{ borderBottom: 'none' }}>
					{sprint.capacity}
				</TableCell>
				<TableCell align='right' sx={{ borderBottom: 'none' }}>
					{filteredRecords.reduce((sum, r) => sum + r.newStoryPoints, 0)}
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell colSpan={6} sx={{ py: 0, borderBottom: expanded ? 1 : 0 }}>
					<Collapse in={expanded} timeout='auto' unmountOnExit>
						<Box sx={{ py: 2, pl: 1, pr: 1 }}>
							<Box sx={{ mb: 2 }}>
								<UsageMetricsTable metrics={sprintMetrics} />
							</Box>
							<UsageRecordsTable
								records={sprint.records}
								filteredRecords={sortedRecords}
								loading={false}
								orderBy={orderBy}
								order={order}
								onSort={onSort}
							/>
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
}
