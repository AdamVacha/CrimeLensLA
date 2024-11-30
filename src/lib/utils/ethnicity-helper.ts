import { ETHNICITY_MAP } from './ethnicity-map';

export function ethnicityHelper(selectedCategory: string | null): string[] {
	if (!selectedCategory) {
		return [];
	}
	const ethnicities = ETHNICITY_MAP.get(selectedCategory) || [];
	return ethnicities;
}
