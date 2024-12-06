// src/lib/utils/map-helpers.ts

export const LA_REGIONS_MAP = new Map([
	[
		'North',
		['Devonshire', 'Foothill', 'Mission', 'N Hollywood', 'Van Nuys', 'West Valley', 'Topanga']
	],
	['South', ['77th Street', 'Harbor', 'Southeast', 'Southwest']],
	['Central', ['Central', 'Hollenbeck', 'Newton', 'Rampart']],
	['East', ['Northeast']],
	['West', ['Hollywood', 'Olympic', 'Pacific', 'West LA', 'Wilshire']]
]);

// Approximate coordinates for each region's center
const REGION_CENTERS: Record<string, [number, number]> = {
	North: [34.2439, -118.4392],
	South: [33.9442, -118.2728],
	Central: [34.0522, -118.2437],
	East: [34.0953, -118.1871],
	West: [34.0736, -118.3766]
};

// Approximate polygon coordinates for each region
export const REGION_BOUNDARIES: Record<string, [number, number][]> = {
	North: [
		[34.3373, -118.6682],
		[34.3373, -118.3553],
		[34.1873, -118.3553],
		[34.1873, -118.6682]
	],
	South: [
		[33.7037, -118.2987],
		[33.7037, -118.1553],
		[33.9037, -118.1553],
		[33.9037, -118.2987]
	],
	Central: [
		[34.0522, -118.2837],
		[34.0522, -118.2037],
		[34.1022, -118.2037],
		[34.1022, -118.2837]
	],
	East: [
		[34.0953, -118.2271],
		[34.0953, -118.1471],
		[34.1453, -118.1471],
		[34.1453, -118.2271]
	],
	West: [
		[34.0736, -118.4166],
		[34.0736, -118.3366],
		[34.1236, -118.3366],
		[34.1236, -118.4166]
	]
};

export function getRegionBoundaries(areas: string[]): [number, number][] {
	// Find which region these areas belong to
	for (const [region, regionAreas] of LA_REGIONS_MAP.entries()) {
		if (areas.some((area) => regionAreas.includes(area))) {
			return REGION_BOUNDARIES[region];
		}
	}
	return REGION_BOUNDARIES['Central']; // Default fallback
}

export function getRegionColor(incidentCount: number): string {
	if (incidentCount > 1000) return '#1d4ed8'; // Dark blue
	if (incidentCount > 500) return '#3b82f6';
	if (incidentCount > 250) return '#60a5fa';
	if (incidentCount > 100) return '#93c5fd';
	return '#bfdbfe'; // Light blue
}

export function getRegionCenter(region: string): [number, number] {
	return REGION_CENTERS[region] || REGION_CENTERS['Central'];
}
