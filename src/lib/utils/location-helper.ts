import { LA_REGIONS_MAP } from './location-map';
export function locationHelper(selectedRegions: string[]): string[] {
	// if no regions selected, return empty array
	if (!selectedRegions || selectedRegions.length === 0) {
		return [];
	}
	// combine regions into single array
	return selectedRegions.reduce((areas, region) => {
		const categoryRegions = LA_REGIONS_MAP.get(region) || [];
		return [...areas, ...categoryRegions];
	}, [] as string[]);
}
