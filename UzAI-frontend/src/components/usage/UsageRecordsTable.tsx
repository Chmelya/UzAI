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

export const CATEGORY_LABELS: Record<number, string> = {
	1: 'Code review',
	2: 'Bug',
	3: 'Feature',
	4: 'Test',
	5: 'Other',
};

export const CATEGORY_ORDER: number[] = [1, 2, 3, 4, 5];

function formatCategory(category: number): string {
	return CATEGORY_LABELS[category] ?? 'Other';
}

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
	/** When true, hide the Category column (e.g. when showing one table per category). */
	hideCategoryColumn?: boolean;
	/** Message when there are no rows to show (e.g. "No records in this category."). */
	emptyMessage?: string;
}

const ALL_COLUMNS: { id: SortColumn; label: string; align?: 'right' }[] = [
	{ id: 'ticketNumber', label: 'Ticket' },
	{ id: 'category', label: 'Category' },
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
	hideCategoryColumn = false,
	emptyMessage,
}: UsageRecordsTableProps) {
	const columns = hideCategoryColumn
		? ALL_COLUMNS.filter((c) => c.id !== 'category')
		: ALL_COLUMNS;
	const colSpan = columns.length;

	return (
		<TableContainer component={Paper} variant='outlined'>
			<Table size='small' aria-label='Usage records table'>
				<TableHead>
					<TableRow>
						{columns.map(({ id, label, align }) => (
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
							<TableCell colSpan={colSpan} align='center' sx={{ py: 4 }}>
								<CircularProgress size={24} />
							</TableCell>
						</TableRow>
					) : records.length === 0 ? (
						<TableRow>
							<TableCell colSpan={colSpan} align='center' sx={{ py: 4 }}>
								No usage records found.
							</TableCell>
						</TableRow>
					) : filteredRecords.length === 0 ? (
						<TableRow>
							<TableCell colSpan={colSpan} align='center' sx={{ py: 4 }}>
								{emptyMessage ?? 'No records match the current filters.'}
							</TableCell>
						</TableRow>
					) : (
						filteredRecords.map((row) => (
							<TableRow key={row.id} hover>
								<TableCell>{row.ticketNumber}</TableCell>
								{!hideCategoryColumn && (
									<TableCell>{formatCategory(row.category)}</TableCell>
								)}
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
