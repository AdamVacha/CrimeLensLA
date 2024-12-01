export const paramHelper = (params: URLSearchParams) => {
	const crimeCategories = params.getAll('crimeCategories');
	const laRegions = params.getAll('laRegions');
	const startDate = params.get('startDate');
	const endDate = params.get('endDate');
	const ageRange = params.get('ageRange');
	const gender = params.get('gender');
	const descent = params.get('descent');
	const eventPeriodStart = params.get('eventPeriodStart');
	const eventPeriodEnd = params.get('eventPeriodEnd');

	return {
		crimeCategories,
		laRegions,
		startDate,
		endDate,
		ageRange,
		gender,
		descent,
		eventPeriodStart,
		eventPeriodEnd
	};
};
