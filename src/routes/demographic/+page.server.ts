//this is where you'll write server side database queries.
import { connection } from '$lib/db';
import { paramHelper } from '$lib/utils/search-param-helper.js';

export async function load({ url }) {
	// common search params from paramHelper in /lib/utils
	const commonParams = paramHelper(url.searchParams);

	// TODO: implement demographic query
	const result = await connection.execute('SELECT AGE FROM VICTIM WHERE ROWNUM < 10');
	console.log(result);

	// This data gets returned to the page component
	return {
		formParams: commonParams
	};
}
