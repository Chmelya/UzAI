import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import { formatMetric } from '../../utils/usageFormatters';
import type { UsageMetrics } from '../../types/usageRecord';

const ROWS: {
	key: keyof UsageMetrics;
	label: string;
	format: (m: UsageMetrics) => string;
}[] = [
	{
		key: 'totalTimeSavedHours',
		label: 'Total savings',
		format: (m) =>
			`${formatMetric(m.totalTimeSavedHours)} h (${formatMetric(
				m.totalTimeSavedPercent
			)}%)`,
	},
	{
		key: 'tasksWithAiPercent',
		label: '% tasks with AI',
		format: (m) => `${formatMetric(m.tasksWithAiPercent)}%`,
	},
	{
		key: 'avgRelativeSavingsWithAiPercent',
		label: 'Avg. relative savings on AI task',
		format: (m) => `${formatMetric(m.avgRelativeSavingsWithAiPercent)}%`,
	},
	{
		key: 'estimationErrorPercent',
		label: 'Estimation accuracy (error)',
		format: (m) => `±${formatMetric(m.estimationErrorPercent)}%`,
	},
];

interface UsageMetricsTableProps {
	metrics: UsageMetrics;
}

export function UsageMetricsTable({ metrics }: UsageMetricsTableProps) {
	return (
		<TableContainer component={Paper} variant='outlined' sx={{ mt: 2 }}>
			<Table size='small' aria-label='Usage metrics'>
				<TableBody>
					{ROWS.map(({ key, label, format }) => (
						<TableRow key={key}>
							<TableCell component='th' scope='row' sx={{ fontWeight: 600 }}>
								{label}
							</TableCell>
							<TableCell align='right'>{format(metrics)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
