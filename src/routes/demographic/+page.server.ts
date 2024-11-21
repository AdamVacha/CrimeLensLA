import { connection } from '$lib/db';
import { paramHelper } from '$lib/utils/search-param-helper.js';
import { crimeCodeHelper } from '$lib/utils/crime-code-helper';
import { locationHelper } from '$lib/utils/location-helper.js';

export async function load({ url }) {
	// common search params from paramHelper in /lib/utils
	const cP = paramHelper(url.searchParams);

	//convert crime categories to crime codes
	const crimeCodes = crimeCodeHelper(cP.crimeCategories);
	// convert region array to regional locations
	const locations = locationHelper(cP.laRegions);

	// TODO: implement demographic query
	const queryParams = [crimeCodes];

	const query = `
		SELECT DISTINCT 
        ct.CRIMECODE,
        ct.DESCRIPTION AS CRIME_TYPE,
        COUNT(*) as INCIDENT_COUNT
    FROM CRIMEINCIDENT ci
    JOIN CRIMEINCIDENTCRIMETYPE cict ON ci.INCIDENTID = cict.INCIDENTID 
    JOIN CRIMETYPE ct ON cict.CRIMECODE = ct.CRIMECODE
    WHERE cict.CRIMECODE IN ('${crimeCodes.join("','")}')
    GROUP BY 
        ct.CRIMECODE,
        ct.DESCRIPTION
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

	// This data gets returned to the page component
	return {
		formParams: cP,
		result: {
			rows: result.rows,
			rowsAffected: result.rowsAffected,
			columns: result.metaData?.map((col) => col.name) || []
		}
	};
}
