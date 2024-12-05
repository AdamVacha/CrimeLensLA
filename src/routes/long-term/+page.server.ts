import { connection } from '$lib/db';
import { paramHelper } from '$lib/utils/search-param-helper.js';
import { crimeCodeHelper } from '$lib/utils/crime-code-helper';
import { locationHelper } from '$lib/utils/location-helper.js';

export async function load({ url }) {
	// Get common search params from paramHelper
	const cP = paramHelper(url.searchParams);

	console.log('timeGran :', cP.timeGranularity);

	// Convert crime categories to crime codes
	const crimeCodes = crimeCodeHelper(cP.crimeCategories);
	// Convert region array to regional locations
	const locations = locationHelper(cP.laRegions);

	// Check if filters are applied
	const hasFilters =
		cP.crimeCategories?.length > 0 ||
		cP.laRegions?.length > 0 ||
		cP.startDate ||
		cP.endDate ||
		cP.descent ||
		cP.gender ||
		cP.ageRange;

	if (!hasFilters) {
		// No filters, return empty result
		return {
			formParams: cP,
			result: {
				rows: [],
				rowsAffected: 0,
				columns: []
			}
		};
	}

	// SQL Query with dynamic time granularity
	const query = `
	WITH CrimeData AS (
		SELECT 
			ct.CRIMECODE,
			ct.DESCRIPTION AS CRIME_TYPE,
			CASE 
				WHEN '${cP.timeGranularity}' = 'Year' THEN TO_CHAR(ci.INCIDENTDATE, 'YYYY')
				WHEN '${cP.timeGranularity}' = 'Quarter' THEN TO_CHAR(ci.INCIDENTDATE, 'YYYY') || '-Q' || TO_CHAR(ci.INCIDENTDATE, 'Q')
				WHEN '${cP.timeGranularity}' = 'Month' THEN TO_CHAR(ci.INCIDENTDATE, 'YYYY-MM')
			END AS TIME_PERIOD
		FROM 
			CRIMEINCIDENT ci
		JOIN 
			CRIMEINCIDENTCRIMETYPE cict ON ci.INCIDENTID = cict.INCIDENTID 
		JOIN 
			CRIMETYPE ct ON cict.CRIMECODE = ct.CRIMECODE
		JOIN 
			LOCATION l ON ci.INCIDENTID = l.INCIDENTID
		JOIN 
			VICTIM v ON ci.INCIDENTID = v.INCIDENTID
		WHERE 
			ci.INCIDENTDATE >= TO_DATE('2020-01-01', 'YYYY-MM-DD')
			${crimeCodes.length ? `AND ct.CRIMECODE IN ('${crimeCodes.join("','")}')` : ''}
			${locations.length ? `AND l.AREA IN ('${locations.join("','")}')` : ''}
			${cP.startDate ? `AND ci.INCIDENTDATE >= TO_DATE('${cP.startDate}', 'YYYY-MM-DD')` : ''}
			${cP.endDate ? `AND ci.INCIDENTDATE <= TO_DATE('${cP.endDate}', 'YYYY-MM-DD')` : ''}
	)
		SELECT 
			CRIMECODE,
			CRIME_TYPE,
			TIME_PERIOD,
			COUNT(*) AS INCIDENT_COUNT
		FROM 
			CrimeData
		GROUP BY 
			CRIMECODE,
			CRIME_TYPE,
			TIME_PERIOD
		ORDER BY 
			TIME_PERIOD ASC, INCIDENT_COUNT DESC`;

	// Execute the query
	const result = await connection.execute(query);

	// Log query information for debugging
	console.log('=========QUERY LOG============');
	console.log('Query Params: ', cP);
	console.log('Crime Type: ', cP.crimeCategories);
	console.log('Columns: ', result.metaData?.map((col) => col.name) || []);
	console.log('Result Rows: ', result.rows);
	console.log('Crime Codes: ', crimeCodes);
	console.log('Locations: ', locations);
	console.log('Descent: ', cP.descent);
	console.log('Time Granularity:', cP.timeGranularity);
	console.log('SQL Query:', query);
	console.log('Start Date: ', cP.startDate);
	console.log('End Date: ', cP.endDate);

	// Return data to the page component
	return {
		formParams: cP,
		query,
		result: {
			rows: result.rows,
			rowsAffected: result.rowsAffected,
			columns: result.metaData?.map((col) => col.name) || []
		}
	};
}
