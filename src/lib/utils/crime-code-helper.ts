import { CRIME_CODES } from './crime-category-map';

export function crimeCodeHelper(selectedCategories: string[]): string[] {
	//handle no category selected
	if (!selectedCategories || selectedCategories.length === 0) {
		return [];
	}
	// combine codes into single array
	const crimeCodes = selectedCategories.reduce((codes, category) => {
		return [...codes, ...(CRIME_CODES[category as keyof typeof CRIME_CODES] || [])];
	}, [] as string[]);
	// return sorted array
	return [...new Set(crimeCodes)].sort();
}
