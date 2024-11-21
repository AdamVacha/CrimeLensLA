import { LA_REGIONS } from './location-map';
export function locationHelper(selectedRegions: string[]): string[] {
	// if no regions selected, return empty array
	if (!selectedRegions || selectedRegions.length === 0) {
		return [];
	}
	// combine regions into single array
	return selectedRegions.reduce((areas, region) => {
		return [...areas, ...(LA_REGIONS[region as keyof typeof LA_REGIONS] || [])];
	}, [] as string[]);
}
