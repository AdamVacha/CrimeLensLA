import { connection } from '$lib/db';
import { paramHelper } from '$lib/utils/search-param-helper.js';
import { crimeCodeHelper } from '$lib/utils/crime-code-helper';
import { locationHelper } from '$lib/utils/location-helper.js';

export async function load({ url }) {
	// common search params from paramHelper in /lib/utils
	const cP = paramHelper(url.searchParams);

	//convert crime categories to crime codes
	const crimeCodes = crimeCodeHelper(cP.crimeCategories);
	//convert region array to regional locations
	const locations = locationHelper(cP.laRegions);

	// TODO: implement demographic query
	const queryParams = [crimeCodes];

	let queryStartDate = cP.startDate;
	let queryEndDate = cP.endDate;

	if (cP.startDate && cP.eventPeriodStart) {
		const startDate = new Date(cP.startDate);
		startDate.setMonth(startDate.getMonth() - Number(cP.eventPeriodStart));
		queryStartDate = startDate.toISOString().split('T')[0];
	}

	if (cP.endDate && cP.eventPeriodEnd) {
		const endDate = new Date(cP.endDate);
		endDate.setMonth(endDate.getMonth() + Number(cP.eventPeriodEnd));
		queryEndDate = endDate.toISOString().split('T')[0];
	}

	// do not contact db server if page is empty
	const hasFilters =
		cP.crimeCategories?.length > 0 ||
		cP.laRegions?.length > 0 ||
		cP.startDate ||
		cP.endDate ||
		cP.descent ||
		cP.gender ||
		cP.ageRange;

	if (!hasFilters) {
		// no filters = empty result
		return {
			formParams: cP,
			result: {
				rows: [],
				rowsAffected: 0,
				columns: []
			}
		};
	}
	const query = `
	SELECT DISTINCT 
        ct.CRIMECODE,
        ct.DESCRIPTION AS CRIME_TYPE,
		ci.INCIDENTDATE,
		l.AREA,
		v.ETHNICITY,
		v.SEX,
		v.AGE,
        COUNT(*) as INCIDENT_COUNT
    FROM CRIMEINCIDENT ci
    JOIN CRIMEINCIDENTCRIMETYPE cict ON ci.INCIDENTID = cict.INCIDENTID 
    JOIN CRIMETYPE ct ON cict.CRIMECODE = ct.CRIMECODE
	JOIN LOCATION l ON ci.INCIDENTID = l.INCIDENTID
	JOIN VICTIM v ON ci.INCIDENTID = v.INCIDENTID
    WHERE 1=1 
		${crimeCodes.length ? `AND cict.CRIMECODE IN ('${crimeCodes.join("','")}')` : ''}
        ${locations.length ? `AND l.AREA IN ('${locations.join("','")}')` : ''}
        ${queryStartDate ? `AND ci.INCIDENTDATE >= TO_DATE('${queryStartDate}', 'YYYY-MM-DD')` : ''}
        ${queryEndDate ? `AND ci.INCIDENTDATE <= TO_DATE('${queryEndDate}', 'YYYY-MM-DD')` : ''}
    GROUP BY 
        ct.CRIMECODE,
        ct.DESCRIPTION,
		ci.INCIDENTDATE,
		l.AREA,
		v.ETHNICITY,
		v.SEX,
		v.AGE
    ORDER BY INCIDENT_COUNT DESC`;

	const result = await connection.execute(query);
	console.log('=========SPACE============');
	console.log('Query Params: ', queryParams);
	console.log('Start Date: ', cP.startDate);
	console.log('End Date: ', cP.endDate);
	console.log('CrimeType: ', cP.crimeCategories);
	console.log('Columns: ', result.metaData?.map((col) => col.name) || []);
	console.log('Result Rows: ', result.rows);
	console.log('Crime Codes: ', crimeCodes);
	console.log('Locations: ', locations);
	console.log('SQL Query:', query);

	// this data gets returned to the page component
	return {
		formParams: cP,
		result: {
			rows: result.rows,
			rowsAffected: result.rowsAffected,
			columns: result.metaData?.map((col) => col.name) || []
		}
	};
}
