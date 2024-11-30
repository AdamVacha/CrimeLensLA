export function ageHelper(
	selectedAgeRange: string | null
): { min: Number | null; max: Number | null } | null {
	if (!selectedAgeRange) {
		return null;
	}

	switch (selectedAgeRange) {
		case '0-18':
			return { min: 0, max: 18 };
		case '19-30':
			return { min: 19, max: 30 };
		case '31-50':
			return { min: 31, max: 50 };
		case '51+':
			return { min: 51, max: 999 };
		case 'Unknown':
			return { min: null, max: null };
		default:
			return null;
	}
}

export function getAgeGroup(age: number | null): string {
	if (age === null) return 'Unknown';
	if (age <= 18) return '0-18';
	if (age <= 30) return '19-30';
	if (age <= 50) return '31-50';
	return '51+';
}
