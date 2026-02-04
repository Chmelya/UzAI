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
		key: 'totalTimeSpentHours',
		label: 'Total time spent',
		format: (m) => `${formatMetric(m.totalTimeSpentHours)} h`,
	},
	{
		key: 'totalTimeSavedHoursWithAi',
		label: 'Total savings (with AI)',
		format: (m) =>
			`${formatMetric(m.totalTimeSavedHoursWithAi)} h (${formatMetric(
				m.totalTimeSavedPercentWithAi
			)}%)`,
	},
	{
		key: 'totalTimeSavedHoursWithoutAi',
		label: 'Total savings (without AI)',
		format: (m) =>
			`${formatMetric(m.totalTimeSavedHoursWithoutAi)} h (${formatMetric(
				m.totalTimeSavedPercentWithoutAi
			)}%)`,
	},
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
		key: 'avgRelativeSavingsOnAiTaskOnlySavesPercent',
		label: 'Avg. relative savings on AI task (saves only)',
		format: (m) =>
			`${formatMetric(m.avgRelativeSavingsOnAiTaskOnlySavesPercent)}%`,
	},
	{
		key: 'avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent',
		label: 'Avg. relative increase in time on AI task (overruns only)',
		format: (m) =>
			`${formatMetric(m.avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent)}%`,
	},
	{
		key: 'avgNetRelativeImpactOnAiTaskPercent',
		label: 'Avg. net relative impact on AI task (savings & overruns)',
		format: (m) => `${formatMetric(m.avgNetRelativeImpactOnAiTaskPercent)}%`,
	},
	{
		key: 'estimationErrorUnderPercentWithAi',
		label: 'Est. error (took less) — with AI',
		format: (m) => `${formatMetric(m.estimationErrorUnderPercentWithAi)}%`,
	},
	{
		key: 'estimationErrorUnderPercentWithoutAi',
		label: 'Est. error (took less) — without AI',
		format: (m) => `${formatMetric(m.estimationErrorUnderPercentWithoutAi)}%`,
	},
	{
		key: 'estimationErrorOverPercentWithAi',
		label: 'Est. error (took more) — with AI',
		format: (m) => `${formatMetric(m.estimationErrorOverPercentWithAi)}%`,
	},
	{
		key: 'estimationErrorOverPercentWithoutAi',
		label: 'Est. error (took more) — without AI',
		format: (m) => `${formatMetric(m.estimationErrorOverPercentWithoutAi)}%`,
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
