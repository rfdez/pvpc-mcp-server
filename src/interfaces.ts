export interface PvpcPrice {
	price: {
		amount: number;
		currencyCode: string;
		currencySymbol: string;
	};
	magnitude: string;
	datetime: string;
	datetimeUtc: string;
	geographicalId: number;
	geographicalName: string;
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
	timeAggregation: string;
	timeTruncation?: string;
	geographicalAggregation: string;
	geographicalIds: number[];
	geographicalTruncation?: string;
}
