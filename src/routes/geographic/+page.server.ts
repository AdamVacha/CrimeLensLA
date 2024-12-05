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

	// do not contact db server if page is empty
	const hasFilters =
		cP.crimeCategories?.length > 0 || cP.laRegions?.length > 0 || cP.startDate || cP.endDate;

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
	SELECT 
		l.AREA,
		TO_CHAR(ci.INCIDENTDATE, 'YYYY-MM') as TIME_PERIOD,
		ct.DESCRIPTION as CRIME_TYPE,
		w.DESCRIPTION as WEAPON_TYPE,
		COUNT(*) as INCIDENT_COUNT
	FROM CRIMEINCIDENT ci
	JOIN LOCATION l ON ci.INCIDENTID = l.INCIDENTID
	JOIN CRIMEINCIDENTCRIMETYPE cict ON ci.INCIDENTID = cict.INCIDENTID 
	JOIN CRIMETYPE ct ON cict.CRIMECODE = ct.CRIMECODE
	LEFT JOIN CRIMEINCIDENTWEAPON ciw ON ci.INCIDENTID = ciw.INCIDENTID  
	LEFT JOIN WEAPON w ON ciw.WEAPONID = w.WEAPONID                      
	WHERE 1=1 
		${crimeCodes.length ? `AND cict.CRIMECODE IN ('${crimeCodes.join("','")}')` : ''}
		${locations.length ? `AND l.AREA IN ('${locations.join("','")}')` : ''}
		${cP.startDate ? `AND ci.INCIDENTDATE >= TO_DATE('${cP.startDate}', 'YYYY-MM-DD')` : ''}
		${cP.endDate ? `AND ci.INCIDENTDATE <= TO_DATE('${cP.endDate}', 'YYYY-MM-DD')` : ''}
	GROUP BY 
		l.AREA,
		TO_CHAR(ci.INCIDENTDATE, 'YYYY-MM'),
		ct.DESCRIPTION,
		w.DESCRIPTION
	ORDER BY 
		TIME_PERIOD ASC,
		l.AREA`;

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
	console.log('Descent: ', cP.descent);
	console.log('SQL Query:', query);

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
