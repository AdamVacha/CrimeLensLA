export const CHART_COLORS = [
	'#FF6384', // Red
	'#36A2EB', // Blue
	'#FFCE56', // Yellow
	'#4BC0C0', // Teal
	'#9966FF', // Purple
	'#FF9F40', // Orange
	'#7CDB8A', // Green
	'#E7E9ED', // Gray
	'#8A2BE2', // Blue Violet
	'#FF69B4' // Pink
];

export function getChartColor(index: number): string {
	return CHART_COLORS[index % CHART_COLORS.length];
}
