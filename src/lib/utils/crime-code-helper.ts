import { CRIME_CODES_MAP } from './crime-category-map';

export function crimeCodeHelper(selectedCategories: string[]): string[] {
	//handle no category selected
	if (!selectedCategories || selectedCategories.length === 0) {
		return [];
	}
	// combine codes into single array
	const crimeCodes = selectedCategories.reduce((codes, category) => {
		const categoryCodes = CRIME_CODES_MAP.get(category) || [];
		return [...codes, ...categoryCodes];
	}, [] as string[]);
	// return sorted array
	return [...new Set(crimeCodes)].sort();
}
