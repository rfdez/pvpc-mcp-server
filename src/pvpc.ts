import QueryString from "qs";
import { PvpcError, type PvpcErrorResponse } from "./error.js";
import type {
	FetchPricesParams,
	FetchPricesResponse,
	PvpcPrice,
} from "./interfaces.js";

export class PvpcApiClient {
	private static readonly PVPC_BASE_URL =
		"https://api.esios.ree.es/indicators/1001";

	private readonly headers: Headers;

	constructor(private readonly key?: string) {
		if (!key) {
			this.key = process.env.ESIOS_API_KEY;

			if (!this.key) {
				throw new Error(
					`Missing API key. See https://api.esios.ree.es/doc/index.html.
					Pass it to the constructor \`new PvpcApiClient("123")\`
					or set the environment variable \`ESIOS_API_KEY\` with your API key.
					`,
				);
			}
		}

		this.headers = new Headers({
			Accept: "application/json; application/vnd.esios-api-v1+json",
			"Content-Type": "application/json",
			"x-api-key": this.key as string,
		});
	}

	private async fetchRequest<T>(path: string, options = {}): Promise<T> {
		let response: Response;

		try {
			response = await fetch(
				`${PvpcApiClient.PVPC_BASE_URL}${path}`,
				options,
			);
		} catch (error) {
			console.error(
				"Error fetching data:",
				error instanceof Error ? error.message : error,
			);

			throw new PvpcError(
				"Unable to fetch data. The request could not be resolved.",
				"NetworkError",
			);
		}

		if (!response.ok) {
			try {
				const error = (await response.json()) as PvpcErrorResponse;

				throw PvpcError.fromResponse(error);
			} catch (err) {
				if (err instanceof SyntaxError) {
					throw new PvpcError(
						"Internal server error. We are unable to process your request right now, please try again later.",
						"ApplicationError",
					);
				}

				if (err instanceof Error) {
					throw new PvpcError(err.message, "ApplicationError");
				}

				throw new PvpcError(response.statusText, "ApplicationError");
			}
		}

		const data = (await response.json()) as T;

		return data;
	}

	private async get<T>(path: string, options = {}) {
		const requestOptions = {
			method: "GET",
			headers: this.headers,
			...options,
		};

		return this.fetchRequest<T>(path, requestOptions);
	}

	async fetchPrices(params: FetchPricesParams): Promise<PvpcPrice[]> {
		const queryParams = {
			locale: params.locale,
			start_date: params.startDate,
			end_date: params.endDate,
			time_agg: params.timeAggregation,
			time_trunc: params.timeTruncation,
			geo_agg: params.geographicalAggregation,
			geo_ids: params.geographicalIds,
			geo_trunc: params.geographicalTruncation,
		};

		const stringQueryParams = QueryString.stringify(queryParams, {
			arrayFormat: "brackets",
			encode: false,
			skipNulls: true,
		});

		const response = await this.get<FetchPricesResponse>(
			`?${stringQueryParams}`,
		);

		const currencyCode = "EUR";
		const currencySymbol = "€";
		const magnitude = "€/MWh";

		return response.indicator.values.map((v) => ({
			price: {
				amount: v.value,
				currencyCode,
				currencySymbol,
			},
			magnitude,
			datetime: v.datetime,
			datetimeUtc: v.datetime_utc,
			geographicalId: v.geo_id,
			geographicalName: v.geo_name,
			updatedAt: response.indicator.values_updated_at,
		}));
	}
}
