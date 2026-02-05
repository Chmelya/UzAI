import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UsageMetrics, UsageRecord, Sprint } from '../types/usageRecord';
import { formatMetric } from './usageFormatters';
import { filterRecords, type UsageTableFilterState } from './usageTableUtils';
import { computeMetricsFromRecords } from './usageMetricsUtils';

const CATEGORY_LABELS: Record<number, string> = {
	1: 'Code review',
	2: 'Bug',
	3: 'Feature',
	4: 'Test',
	5: 'Other',
};

const CATEGORY_ORDER = [1, 2, 3, 4, 5];

const METRICS_ROWS: { label: string; format: (m: UsageMetrics) => string }[] = [
	{ label: 'Total time spent', format: (m) => `${formatMetric(m.totalTimeSpentHours)} h` },
	{
		label: 'Total savings (with AI)',
		format: (m) =>
			`${formatMetric(m.totalTimeSavedHoursWithAi)} h (${formatMetric(m.totalTimeSavedPercentWithAi)}%)`,
	},
	{
		label: 'Total savings',
		format: (m) =>
			`${formatMetric(m.totalTimeSavedHours)} h (${formatMetric(m.totalTimeSavedPercent)}%)`,
	},
	{ label: '% tasks with AI', format: (m) => `${formatMetric(m.tasksWithAiPercent)}%` },
	{
		label: 'Avg. relative savings on AI task (saves only)',
		format: (m) => `${formatMetric(m.avgRelativeSavingsOnAiTaskOnlySavesPercent)}%`,
	},
	{
		label: 'Avg. relative increase in time on AI task (overruns only)',
		format: (m) => `${formatMetric(m.avgRelativeIncreaseOnAiTaskOnlyOverrunsPercent)}%`,
	},
	{
		label: 'Avg. net relative impact on AI task (savings & overruns)',
		format: (m) => `${formatMetric(m.avgNetRelativeImpactOnAiTaskPercent)}%`,
	},
];

function formatMinutesAsHoursAndMinutes(minutes: number): string {
	const sign = minutes < 0 ? '-' : '';
	const total = Math.abs(Math.round(minutes));
	const h = Math.floor(total / 60);
	const m = total % 60;
	if (h === 0) return `${sign}${m} min`;
	if (m === 0) return `${sign}${h} h`;
	return `${sign}${h} h ${m} min`;
}

function groupRecordsByCategory(records: UsageRecord[]): Map<number, UsageRecord[]> {
	const map = new Map<number, UsageRecord[]>();
	for (const catId of CATEGORY_ORDER) {
		map.set(catId, []);
	}
	for (const r of records) {
		const list = map.get(r.category) ?? [];
		list.push(r);
		map.set(r.category, list);
	}
	return map;
}

export interface UsageReportPdfOptions {
	year: string;
	metrics: UsageMetrics;
	sprints: Sprint[];
	filter: UsageTableFilterState;
}

/**
 * Builds a PDF report with statistics and sprint tables for the given year.
 * Uses the same filter as the UI. Saves only data for the selected year.
 */
export function buildUsageReportPdf(options: UsageReportPdfOptions): jsPDF {
	const { year, metrics, sprints, filter } = options;
	const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
	const margin = 14;
	let y = margin;
	const lineHeight = 7;

	// Title
	doc.setFontSize(16);
	doc.text(`Usage Report — ${year}`, margin, y);
	y += lineHeight + 4;

	// Statistics section
	doc.setFontSize(12);
	doc.text('Total statistics', margin, y);
	y += lineHeight;

	const statsBody = METRICS_ROWS.map((row) => [row.label, row.format(metrics)]);
	autoTable(doc, {
		startY: y,
		head: [['Metric', 'Value']],
		body: statsBody,
		theme: 'grid',
		headStyles: { fillColor: [66, 139, 202] },
		margin: { left: margin, right: margin },
	});
	// First page ends with total statistics only; each sprint starts on a new page

	// Sprints: each sprint on its own page, starting with sprint statistics
	for (const sprint of sprints) {
		doc.addPage();
		let ySprint = margin;

		const filteredRecords = filterRecords(sprint.records, filter);
		const sprintMetrics = computeMetricsFromRecords(filteredRecords);
		const recordsByCategory = groupRecordsByCategory(filteredRecords);

		// Sprint header
		doc.setFontSize(12);
		doc.text(`Sprint ${sprint.name}`, margin, ySprint);
		ySprint += lineHeight;
		doc.setFontSize(10);
		doc.text(
			`${sprint.startDate} — ${sprint.endDate}  ·  Capacity: ${sprint.capacity}  ·  Actual: ${filteredRecords.reduce((s, r) => s + r.newStoryPoints, 0)}`,
			margin,
			ySprint
		);
		ySprint += lineHeight + 4;

		// Sprint statistics
		doc.setFontSize(11);
		doc.text('Sprint statistics', margin, ySprint);
		ySprint += lineHeight;

		const sprintStatsBody = METRICS_ROWS.map((row) => [
			row.label,
			row.format(sprintMetrics),
		]);
		autoTable(doc, {
			startY: ySprint,
			head: [['Metric', 'Value']],
			body: sprintStatsBody,
			theme: 'grid',
			headStyles: { fillColor: [100, 100, 100] },
			margin: { left: margin, right: margin },
		});
		ySprint = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

		// Category tables
		for (const categoryId of CATEGORY_ORDER) {
			const records = recordsByCategory.get(categoryId) ?? [];
			const label = CATEGORY_LABELS[categoryId] ?? 'Other';

			if (ySprint > 260) {
				doc.addPage();
				ySprint = margin;
			}

			doc.setFontSize(10);
			doc.text(label, margin, ySprint);
			ySprint += lineHeight;

			if (records.length === 0) {
				doc.setFontSize(9);
				doc.text('No records in this category.', margin + 2, ySprint);
				ySprint += lineHeight + 4;
				continue;
			}

			const recordHeaders = [
				'Ticket',
				'Employee',
				'Story pts',
				'New pts',
				'AI',
				'Time spent',
				'Time saved',
			];
			const recordRows = records.map((r) => [
				r.ticketNumber,
				`${r.employeeName} ${r.employeeSurname}`,
				String(r.storyPoints),
				String(r.newStoryPoints),
				r.isAiUsed ? 'Yes' : 'No',
				formatMinutesAsHoursAndMinutes(r.timeSpent),
				formatMinutesAsHoursAndMinutes(r.timeSaved),
			]);

			autoTable(doc, {
				startY: ySprint,
				head: [recordHeaders],
				body: recordRows,
				theme: 'grid',
				headStyles: { fillColor: [100, 100, 100], fontSize: 8 },
				bodyStyles: { fontSize: 8 },
				margin: { left: margin, right: margin },
			});
			ySprint =
				(doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
		}
	}

	return doc;
}

/**
 * Builds the report PDF and triggers download. File name: `usage-report-{year}.pdf`.
 */
export function downloadUsageReportPdf(options: UsageReportPdfOptions): void {
	const doc = buildUsageReportPdf(options);
	doc.save(`usage-report-${options.year}.pdf`);
}
