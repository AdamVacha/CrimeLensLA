// this is where we initialize db connection.
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	const response = await resolve(event);
	console.log(event.url);
	return response;
}) satisfies Handle;
