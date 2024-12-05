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

	// calc during dates
	const duringEventStart = cP.startDate ? new Date(cP.startDate) : new Date('2024-01-01');
	const duringEventEnd = cP.endDate ? new Date(cP.endDate) : new Date('2024-03-31');

	// calc before dates
	const beforeEventStart = new Date(duringEventStart);
	// get total months
	const totalMonths = beforeEventStart.getMonth() + beforeEventStart.getFullYear() * 12;
	// subtrack months
	const targetMonths = totalMonths - (Number(cP.monthsBeforeEvent) || 0);
	// then convert back to year month
	beforeEventStart.setFullYear(Math.floor(targetMonths / 12));
	beforeEventStart.setMonth(targetMonths % 12);

	// calc before event end
	const beforeEventEnd = new Date(duringEventStart);
	beforeEventEnd.setDate(beforeEventEnd.getDate() - 1);

	// calc after event period
	const afterEventStart = new Date(duringEventEnd);
	afterEventStart.setDate(afterEventStart.getDate() + 1);
	const afterEventEnd = new Date(afterEventStart);
	afterEventEnd.setMonth(afterEventStart.getMonth() + (Number(cP.monthsAfterEvent) || 0));

	// format dates
	const formatSQLDate = (date: Date) => date.toISOString().split('T')[0];
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
	const query = `
	SELECT DISTINCT 
        ct.CRIMECODE,
        ct.DESCRIPTION AS CRIME_TYPE,
        ci.INCIDENTDATE,
        l.AREA,
        COUNT(*) as INCIDENT_COUNT,
        CASE
            WHEN ci.INCIDENTDATE BETWEEN TO_DATE('${formatSQLDate(beforeEventStart)}', 'YYYY-MM-DD')
                AND TO_DATE('${formatSQLDate(beforeEventEnd)}', 'YYYY-MM-DD')
                THEN 'Before Event'
            WHEN ci.INCIDENTDATE BETWEEN TO_DATE('${formatSQLDate(duringEventStart)}', 'YYYY-MM-DD')
                AND TO_DATE('${formatSQLDate(duringEventEnd)}', 'YYYY-MM-DD')
                THEN 'During Event'
            WHEN ci.INCIDENTDATE BETWEEN TO_DATE('${formatSQLDate(afterEventStart)}', 'YYYY-MM-DD')
                AND TO_DATE('${formatSQLDate(afterEventEnd)}', 'YYYY-MM-DD')
                THEN 'After Event'
        END AS EVENT_PERIOD
    FROM CRIMEINCIDENT ci
    JOIN CRIMEINCIDENTCRIMETYPE cict ON ci.INCIDENTID = cict.INCIDENTID 
    JOIN CRIMETYPE ct ON cict.CRIMECODE = ct.CRIMECODE
    JOIN LOCATION l ON ci.INCIDENTID = l.INCIDENTID
    WHERE 1=1 
        ${crimeCodes.length ? `AND cict.CRIMECODE IN ('${crimeCodes.join("','")}')` : ''}
        ${locations.length ? `AND l.AREA IN ('${locations.join("','")}')` : ''}
        AND ci.INCIDENTDATE BETWEEN 
            TO_DATE('${formatSQLDate(beforeEventStart)}', 'YYYY-MM-DD')
            AND TO_DATE('${formatSQLDate(afterEventEnd)}', 'YYYY-MM-DD')
    GROUP BY 
        ct.CRIMECODE,
        ct.DESCRIPTION,
        ci.INCIDENTDATE,
        l.AREA,
        CASE
            WHEN ci.INCIDENTDATE BETWEEN TO_DATE('${formatSQLDate(beforeEventStart)}', 'YYYY-MM-DD')
                AND TO_DATE('${formatSQLDate(beforeEventEnd)}', 'YYYY-MM-DD')
                THEN 'Before Event'
            WHEN ci.INCIDENTDATE BETWEEN TO_DATE('${formatSQLDate(duringEventStart)}', 'YYYY-MM-DD')
                AND TO_DATE('${formatSQLDate(duringEventEnd)}', 'YYYY-MM-DD')
                THEN 'During Event'
            WHEN ci.INCIDENTDATE BETWEEN TO_DATE('${formatSQLDate(afterEventStart)}', 'YYYY-MM-DD')
                AND TO_DATE('${formatSQLDate(afterEventEnd)}', 'YYYY-MM-DD')
                THEN 'After Event'
        END
    ORDER BY ci.INCIDENTDATE ASC, INCIDENT_COUNT DESC`;

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
		query,
		result: {
			rows: result.rows,
			rowsAffected: result.rowsAffected,
			columns: result.metaData?.map((col) => col.name) || []
		}
	};
}
