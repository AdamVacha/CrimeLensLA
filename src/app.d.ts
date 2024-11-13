// See https://svelte.dev/docs/kit/types#app.d.ts

import type OracleDB from 'oracledb';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			dbconn: OracleDB.Connection;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
