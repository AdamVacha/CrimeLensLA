// src/lib/types.ts
export interface CrimeRecord {
	DR_NO: string;
	Report_Date: string;
	Incident_Date: string;
	Incident_Time: string;
	Area_Name: string;
	Crime_Code: string;
	Crime_Description: string;
	Victim_Age: number | null;
	Victim_Sex: string;
	Victim_Descent: string;
	Modus_Operandi: string | null;
	Weapon_Code: string | null;
	Weapon_Description: string | null;
	Street_Address: string;
	Cross_Street: string | null;
	Latitude: number | null;
	Longitude: number | null;
	Status: string;
}

export interface TableData<T> {
	rows: T[];
	columns: string[];
}

export interface ValidationMetric {
	METRIC: string;
	COUNT: number;
}

export interface TableCounts {
	total_records: number;
	unique_incidents: number;
	unique_areas: number;
	unique_crimes: number;
	unique_locations: number;
}

export interface AreaStat {
	AREA_NAME: string;
	total_incidents: number;
	unique_crimes: number;
	avg_victim_age: number;
}

export interface CrimeTypeStat {
	CRIME_CODE: string;
	CRIME_DESCRIPTION: string;
	incident_count: number;
}

export interface LocationStat {
	STREET_ADDRESS: string;
	LATITUDE: number;
	LONGITUDE: number;
	incident_count: number;
}

export interface PageData {
	data: {
		crimeType: TableData<CrimeTypeStat>;
		location: TableData<LocationStat>;
		areaStats: TableData<AreaStat>;
		counts: TableCounts;
		validation: TableData<ValidationMetric>;
	};
}
