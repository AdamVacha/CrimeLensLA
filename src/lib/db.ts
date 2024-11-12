import oracledb from 'oracledb';
import { env } from '$env/dynamic/private';

const dbconfig = {
	user: env.ORACLE_USER,
	password: env.ORACLE_PASSWORD,
	connectString: env.ORACLE_CONNECTION_STRING
};

export const connection = await oracledb.getConnection(dbconfig);
