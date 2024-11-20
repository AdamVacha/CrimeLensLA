//this is where you'll write server side database queries.
import { connection } from '$lib/db';
import { paramHelper } from '$lib/utils/search-param-helper.js';

export async function load({ url }) {
	const params = url.searchParams;
	// common search params from paramHelper in /lib/utils
	const commonParams = paramHelper(url.searchParams);

	console.log(params.getAll('startDate'));

	// TODO: implement queries

	// This data gets returned to the page component
	return {
		formParams: commonParams
	};
}
