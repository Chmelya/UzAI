import {
	Paper,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Stack,
	Collapse,
	IconButton,
	Button,
	Box,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import type { UsageTableFilterState } from '../../utils/usageTableUtils';
import { hasActiveFilters } from '../../utils/usageTableUtils';

const INPUT_WIDTH = 92;
const DATE_WIDTH = 130;
const SELECT_WIDTH = 96;

interface UsageTableFiltersProps {
	open: boolean;
	onToggleOpen: () => void;
	filter: UsageTableFilterState;
	onFilterChange: (next: UsageTableFilterState) => void;
	onClear: () => void;
}

export function UsageTableFilters({
	open,
	onToggleOpen,
	filter,
	onFilterChange,
	onClear,
}: UsageTableFiltersProps) {
	const active = hasActiveFilters(filter);

	return (
		<Paper
			variant='outlined'
			sx={{
				mb: 2,
				overflow: 'hidden',
				'& .MuiInputBase-root': { fontSize: '0.8125rem' },
				'& .MuiInputLabel-root': { fontSize: '0.8125rem' },
			}}
		>
			<Stack
				direction='row'
				alignItems='center'
				justifyContent='space-between'
				onClick={onToggleOpen}
				sx={{
					px: 1.5,
					py: 0.75,
					cursor: 'pointer',
					'&:hover': { bgcolor: 'action.hover' },
				}}
			>
				<Stack direction='row' alignItems='center' spacing={0.5}>
					<IconButton
						size='small'
						onClick={(e) => {
							e.stopPropagation();
							onToggleOpen();
						}}
						aria-label={open ? 'Hide filters' : 'Show filters'}
						sx={{ p: 0.5 }}
					>
						{open ? (
							<FilterListOffIcon fontSize='small' />
						) : (
							<FilterListIcon fontSize='small' />
						)}
					</IconButton>
					<Box component='span' sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
						Filters
					</Box>
					{active && (
						<Box
							component='span'
							sx={{
								fontSize: '0.75rem',
								color: 'text.secondary',
								ml: 0.5,
							}}
						>
							active
						</Box>
					)}
				</Stack>
				{active && (
					<Button
						size='small'
						onClick={(e) => {
							e.stopPropagation();
							onClear();
						}}
						sx={{ minWidth: 0, py: 0.25, px: 1, fontSize: '0.75rem' }}
					>
						Clear
					</Button>
				)}
			</Stack>
			<Collapse in={open}>
				<Stack
					direction='row'
					flexWrap='wrap'
					gap={1.5}
					alignItems='flex-end'
					sx={{ px: 1.5, pb: 1.5, pt: 0 }}
				>
					<TextField
						size='small'
						label='From'
						type='date'
						value={filter.dateFrom}
						onChange={(e) =>
							onFilterChange({ ...filter, dateFrom: e.target.value })
						}
						InputLabelProps={{ shrink: true }}
						sx={{ width: DATE_WIDTH }}
						variant='outlined'
					/>
					<TextField
						size='small'
						label='To'
						type='date'
						value={filter.dateTo}
						onChange={(e) =>
							onFilterChange({ ...filter, dateTo: e.target.value })
						}
						InputLabelProps={{ shrink: true }}
						sx={{ width: DATE_WIDTH }}
						variant='outlined'
					/>
					<FormControl size='small' sx={{ width: SELECT_WIDTH }}>
						<InputLabel>AI</InputLabel>
						<Select
							value={filter.aiUsed}
							label='AI'
							onChange={(e) =>
								onFilterChange({
									...filter,
									aiUsed: e.target.value as 'all' | 'yes' | 'no',
								})
							}
						>
							<MenuItem value='all'>All</MenuItem>
							<MenuItem value='yes'>Yes</MenuItem>
							<MenuItem value='no'>No</MenuItem>
						</Select>
					</FormControl>
					<Stack direction='row' spacing={0.75} alignItems='flex-end'>
						<TextField
							size='small'
							label='Story pts'
							placeholder='min'
							type='number'
							inputProps={{ min: 0, max: 255 }}
							value={filter.storyPointsMin}
							onChange={(e) =>
								onFilterChange({ ...filter, storyPointsMin: e.target.value })
							}
							sx={{ width: INPUT_WIDTH }}
							variant='outlined'
						/>
						<TextField
							size='small'
							placeholder='max'
							type='number'
							inputProps={{ min: 0, max: 255 }}
							value={filter.storyPointsMax}
							onChange={(e) =>
								onFilterChange({ ...filter, storyPointsMax: e.target.value })
							}
							sx={{ width: INPUT_WIDTH }}
							variant='outlined'
						/>
					</Stack>
					<Stack direction='row' spacing={0.75} alignItems='flex-end'>
						<TextField
							size='small'
							label='Time spent'
							placeholder='min'
							type='number'
							inputProps={{ min: 0 }}
							value={filter.timeSpentMin}
							onChange={(e) =>
								onFilterChange({ ...filter, timeSpentMin: e.target.value })
							}
							sx={{ width: INPUT_WIDTH }}
							variant='outlined'
						/>
						<TextField
							size='small'
							placeholder='max'
							type='number'
							inputProps={{ min: 0 }}
							value={filter.timeSpentMax}
							onChange={(e) =>
								onFilterChange({ ...filter, timeSpentMax: e.target.value })
							}
							sx={{ width: INPUT_WIDTH }}
							variant='outlined'
						/>
					</Stack>
					<Stack direction='row' spacing={0.75} alignItems='flex-end'>
						<TextField
							size='small'
							label='Time saved'
							placeholder='min'
							type='number'
							inputProps={{ min: 0 }}
							value={filter.timeSavedMin}
							onChange={(e) =>
								onFilterChange({ ...filter, timeSavedMin: e.target.value })
							}
							sx={{ width: INPUT_WIDTH }}
							variant='outlined'
						/>
						<TextField
							size='small'
							placeholder='max'
							type='number'
							inputProps={{ min: 0 }}
							value={filter.timeSavedMax}
							onChange={(e) =>
								onFilterChange({ ...filter, timeSavedMax: e.target.value })
							}
							sx={{ width: INPUT_WIDTH }}
							variant='outlined'
						/>
					</Stack>
				</Stack>
			</Collapse>
		</Paper>
	);
}
