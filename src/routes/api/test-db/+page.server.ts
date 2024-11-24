//this is where you'll write server side database queries.
import type { PageServerLoad } from './$types';
import { connection } from '$lib/db';
import { DiagConsoleLogger } from '@opentelemetry/api';

export const load: PageServerLoad = async () => {
	//replacable. SELECT 1 FROM DUAL is dummy query from Oracle
	const result = await connection.execute(`SELECT 1 FROM DUAL`);

	return {
		result: {
			rows: result.rows,
			rowsAffected: result.rowsAffected,
			columns: result.metaData?.map((col) => col.name) || []
		}
	};
};
