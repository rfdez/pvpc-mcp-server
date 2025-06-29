export interface PvpcPrice {
	price: number;
	currency: string;
	magnitude: string;
	datetime: string;
	datetimeUtc: string;
	geoId: number;
	geoName: string;
	updatedAt: string;
}

export interface FetchPricesResponse {
	indicator: {
		values: {
			value: number;
			datetime: string;
			datetime_utc: string;
			geo_id: number;
			geo_name: string;
		}[];
		values_updated_at: string;
	};
}

export interface FetchPricesParams {
	locale: string;
	startDate: string;
	endDate: string;
	timeTrunc: string;
	geoIds: number[];
}
