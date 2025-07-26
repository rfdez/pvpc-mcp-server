import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { endOfToday, startOfToday } from "date-fns";
import * as z from "zod";
import { PvpcError } from "./error.js";
import { PvpcApiClient } from "./pvpc.js";

export class PvpcMcpServer {
	private readonly server: McpServer;

	constructor(private readonly apiClient: PvpcApiClient) {
		this.server = new McpServer(
			{
				name: "pvpc-mcp-server",
				title: "Voluntary Price for the Small Consumer (PVPC) MCP Server",
				version: "2.0.2",
			},
			{
				instructions:
					"Use this server to fetch the Voluntary Price for the Small Consumer (PVPC) for consumers billed under the 2.0 TD tariff.",
			},
		);

		this.registerTools();
	}

	async start(): Promise<void> {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
	}

	async stop(): Promise<void> {
		await this.server.close();
	}

	private registerTools() {
		this.server.registerTool(
			"fetch_prices",
			{
				title: "Fetch PVPC Prices",
				description:
					"Fetches the Voluntary Price for the Small Consumer (PVPC) prices for a given date range and geographical area.",
				inputSchema: {
					locale: z
						.enum(["es", "en"])
						.default("es")
						.describe(
							"Defines the response language. Accepted values: `es`, `en`. Defaults to `es`.",
						),
					startDate: z
						.string()
						.default(startOfToday().toISOString())
						.describe(
							"Defines the starting date in iso8601 format. E.g. 2025-06-29T00:00:00.000+02:00. Defaults to the start of today.",
						),
					endDate: z
						.string()
						.default(endOfToday().toISOString())
						.describe(
							"Defines the ending date in iso8601 format. E.g. 2025-06-29T23:59:59.999+02:00. Defaults to the end of today.",
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
						.default("hour")
						.describe(
							"Defines the time aggregation of the requested data. Accepted values: `five_minutes`, `ten_minutes`, `fifteen_minutes`, `hour`, `day`, `month`, `year`. Defaults to `hour`.",
						),
					geoIds: z
						.array(z.number())
						.default(Object.keys(PvpcApiClient.GEOS).map(Number))
						.describe(
							`Defines the geographical IDs to filter the prices. Available IDs: ${Object.entries(
								PvpcApiClient.GEOS,
							)
								.map(([id, name]) => `${id} (${name})`)
								.join(
									", ",
								)}. Defaults to all available geographical IDs.`,
						),
				},
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
