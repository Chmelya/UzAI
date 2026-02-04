import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	CircularProgress,
} from '@mui/material';
import type { UsageRecord } from '../../types/usageRecord';
import type { SortColumn, SortOrder } from '../../utils/usageTableUtils';

function formatMinutesAsHoursAndMinutes(minutes: number): string {
	const sign = minutes < 0 ? '-' : '';
	const total = Math.abs(Math.round(minutes));
	const h = Math.floor(total / 60);
	const m = total % 60;
	if (h === 0) return `${sign}${m} min`;
	if (m === 0) return `${sign}${h} h`;
	return `${sign}${h} h ${m} min`;
}

interface UsageRecordsTableProps {
	records: UsageRecord[];
	filteredRecords: UsageRecord[];
	loading: boolean;
	orderBy: SortColumn;
	order: SortOrder;
	onSort: (column: SortColumn) => void;
}

const COLUMNS: { id: SortColumn; label: string; align?: 'right' }[] = [
	{ id: 'ticketNumber', label: 'Ticket' },
	{ id: 'employeeName', label: 'Employee' },
	{ id: 'storyPoints', label: 'Story pts', align: 'right' },
	{ id: 'newStoryPoints', label: 'New story pts', align: 'right' },
	{ id: 'isAiUsed', label: 'AI used' },
	{ id: 'timeSpent', label: 'Time spent', align: 'right' },
	{ id: 'timeSaved', label: 'Time saved', align: 'right' },
];

export function UsageRecordsTable({
	records,
	filteredRecords,
	loading,
	orderBy,
	order,
	onSort,
}: UsageRecordsTableProps) {
	return (
		<TableContainer component={Paper} variant='outlined'>
			<Table size='small' aria-label='Usage records table'>
				<TableHead>
					<TableRow>
						{COLUMNS.map(({ id, label, align }) => (
							<TableCell
								key={id}
								align={align}
								sortDirection={orderBy === id ? order : false}
							>
								<TableSortLabel
									active={orderBy === id}
									direction={orderBy === id ? order : 'asc'}
									onClick={() => onSort(id)}
								>
									{label}
								</TableSortLabel>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{loading ? (
						<TableRow>
							<TableCell colSpan={7} align='center' sx={{ py: 4 }}>
								<CircularProgress size={24} />
							</TableCell>
						</TableRow>
					) : records.length === 0 ? (
						<TableRow>
							<TableCell colSpan={7} align='center' sx={{ py: 4 }}>
								No usage records found.
							</TableCell>
						</TableRow>
					) : filteredRecords.length === 0 ? (
						<TableRow>
							<TableCell colSpan={7} align='center' sx={{ py: 4 }}>
								No records match the current filters.
							</TableCell>
						</TableRow>
					) : (
						filteredRecords.map((row) => (
							<TableRow key={row.id} hover>
								<TableCell>{row.ticketNumber}</TableCell>
								<TableCell>{`${row.employeeName} ${row.employeeSurname}`}</TableCell>
								<TableCell align='right'>{row.storyPoints}</TableCell>
								<TableCell align='right'>{row.newStoryPoints}</TableCell>
								<TableCell>{row.isAiUsed ? 'Yes' : 'No'}</TableCell>
								<TableCell align='right'>
									{formatMinutesAsHoursAndMinutes(row.timeSpent)}
								</TableCell>
								<TableCell align='right'>
									{formatMinutesAsHoursAndMinutes(row.timeSaved)}
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
