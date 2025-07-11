import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { endOfToday, startOfToday } from "date-fns";
import z from "zod";
import packageJson from "../package.json" with { type: "json" };
import { PvpcError } from "./error.js";
import { PvpcApiClient } from "./pvpc.js";

export class PvpcMcpServer {
	private readonly server: McpServer;

	constructor(private readonly apiClient: PvpcApiClient) {
		this.server = new McpServer(
			{
				name: "pvpc-mcp-server",
				version: packageJson.version,
			},
			{
				instructions:
					"Use this server to fetch electricity prices in the PVPC market.",
			},
		);

		this.setupTools();
	}

	async start(): Promise<void> {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
	}

	async stop(): Promise<void> {
		await this.server.close();
	}

	private setupTools() {
		this.server.tool(
			"pvpc_fetch_prices",
			"Fetch PVPC Prices",
			{
				locale: z
					.enum(["es", "en"])
					.optional()
					.default("es")
					.describe(
						"Locale for the prices. Accepted values: `es`, `en`. Defaults to `es`.",
					),
				startDate: z
					.string()
					.optional()
					.default(startOfToday().toISOString())
					.describe(
						"Beginning of the date range to filter indicator values (iso8601 format). E.g. 2025-06-29T00:00:00.000+02:00. Defaults to the start of today.",
					),
				endDate: z
					.string()
					.optional()
					.default(endOfToday().toISOString())
					.describe(
						"End of the date range to filter indicator values (iso8601 format). E.g. 2025-06-29T23:59:59.999+02:00. Defaults to the end of today.",
					),
				timeTrunc: z
					.enum([
						"five_minutes",
						"ten_minutes",
						"fifteen_minutes",
						"hour",
						"day",
						"month",
						"year",
					])
					.optional()
					.default("hour")
					.describe(
						"Tells the API how to trunc data time series. Accepted values: `five_minutes`, `ten_minutes`, `fifteen_minutes`, `hour`, `day`, `month`, `year`. Defaults to `hour`.",
					),
				geoIds: z
					.array(z.number())
					.optional()
					.default(Object.keys(PvpcApiClient.GEOS).map(Number))
					.describe(
						`Array of geographical IDs to filter the prices. Available IDs: ${Object.entries(
							PvpcApiClient.GEOS,
						)
							.map(([id, name]) => `${id} (${name})`)
							.join(
								", ",
							)}. Defaults to all available geographical IDs.`,
					),
			},
			async ({ locale, startDate, endDate, timeTrunc, geoIds }) => {
				try {
					const prices = await this.apiClient.fetchPrices({
						locale,
						startDate,
						endDate,
						timeTrunc,
						geoIds,
					});

					return {
						content: [
							{
								type: "text",
								text: JSON.stringify(prices, null, 2),
							},
						],
					};
				} catch (error) {
					if (error instanceof PvpcError) {
						return {
							content: [
								{
									type: "text",
									text: `Failed to fetch prices: ${error.name} - ${error.message}\nStatus: ${error.status}`,
								},
							],
							isError: true,
						};
					}

					return {
						content: [
							{
								type: "text",
								text: "Failed to fetch prices: Unknown error",
							},
						],
						isError: true,
					};
				}
			},
		);
	}
}
