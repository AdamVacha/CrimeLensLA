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

	// do not contact db server if page is empty
	const hasFilters =
		cP.crimeCategories?.length > 0 ||
		cP.laRegions?.length > 0 ||
		cP.startDate ||
		cP.endDate ||
		cP.selectedSeason ||
		cP.selectedHoliday;

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

	let query = `
	SELECT DISTINCT 
		ct.CRIMECODE,
		ct.DESCRIPTION AS CRIME_TYPE,
		ci.INCIDENTDATE,
		l.AREA,
		COUNT(*) AS INCIDENT_COUNT,
		CASE
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) BETWEEN 3 AND 5 THEN 'Spring'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) BETWEEN 6 AND 8 THEN 'Summer'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) BETWEEN 9 AND 11 THEN 'Fall'
			ELSE 'Winter'
		END AS SEASON,
		CASE
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 3 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 17 THEN 'StPatricksDay'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 7 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 4 THEN 'July4th'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 11 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = EXTRACT(DAY FROM (LAST_DAY(DATE '2023-11-01') - 21)) THEN 'Thanksgiving'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 12 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 25 THEN 'Christmas'
			WHEN (EXTRACT(MONTH FROM ci.INCIDENTDATE) = 12 AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 31)
            	OR (EXTRACT(MONTH FROM ci.INCIDENTDATE) = 1 AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 1) THEN 'NewYears'
			ELSE 'Regular Day'
		END AS HOLIDAY
		FROM CRIMEINCIDENT ci
		JOIN CRIMEINCIDENTCRIMETYPE cict ON ci.INCIDENTID = cict.INCIDENTID
		JOIN CRIMETYPE ct ON cict.CRIMECODE = ct.CRIMECODE
		JOIN LOCATION l ON ci.INCIDENTID = l.INCIDENTID
		WHERE 1=1
			${crimeCodes.length ? `AND cict.CRIMECODE IN ('${crimeCodes.join("','")}')` : ''}
			${locations.length ? `AND l.AREA IN ('${locations.join("','")}')` : ''}
			${cP.startDate ? `AND ci.INCIDENTDATE >= TO_DATE('${cP.startDate}', 'YYYY-MM-DD')` : ''}
			${cP.endDate ? `AND ci.INCIDENTDATE <= TO_DATE('${cP.endDate}', 'YYYY-MM-DD')` : ''}
		GROUP BY 
		ct.CRIMECODE,
		ct.DESCRIPTION,
		ci.INCIDENTDATE,
		l.AREA,
		CASE
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) BETWEEN 3 AND 5 THEN 'Spring'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) BETWEEN 6 AND 8 THEN 'Summer'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) BETWEEN 9 AND 11 THEN 'Fall'
			ELSE 'Winter'
      	END,
		CASE
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 3 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 17 THEN 'StPatricksDay'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 7 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 4 THEN 'July4th'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 11 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = EXTRACT(DAY FROM (LAST_DAY(DATE '2023-11-01') - 21)) THEN 'Thanksgiving'
			WHEN EXTRACT(MONTH FROM ci.INCIDENTDATE) = 12 
				AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 25 THEN 'Christmas'
			WHEN (EXTRACT(MONTH FROM ci.INCIDENTDATE) = 12 AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 31)
            	OR (EXTRACT(MONTH FROM ci.INCIDENTDATE) = 1 AND EXTRACT(DAY FROM ci.INCIDENTDATE) = 1) THEN 'NewYears'
		END
		ORDER BY INCIDENT_COUNT DESC`;

	const result = await connection.execute(query);

	console.log('=========SPACE============');
	console.log('Start Date: ', cP.startDate);
	console.log('End Date: ', cP.endDate);
	console.log('CrimeType: ', cP.crimeCategories);
	console.log('Columns: ', result.metaData?.map((col) => col.name) || []);
	console.log('Result Rows: ', result.rows);
	console.log('Crime Codes: ', crimeCodes);
	console.log('Locations: ', locations);
	console.log('Descent: ', cP.descent);
	console.log('SQL Query:', query);
	console.log('pre season helper: ', cP.selectedSeason);

	// this data gets returned to the page component
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
