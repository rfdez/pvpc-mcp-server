import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { endOfToday, startOfToday } from "date-fns";
import { z } from "zod";
import { PvpcError } from "./error.js";
import { PvpcApiClient } from "./pvpc.js";

export class PvpcMcpServer {
	private readonly server: McpServer;

	constructor(private readonly apiClient: PvpcApiClient) {
		this.server = new McpServer(
			{
				name: "pvpc-mcp-server",
				title: "Voluntary Price for the Small Consumer (PVPC) MCP Server",
				version: "3.2.1",
			},
			{
				instructions:
					"Use this server to fetch the Voluntary Price for the Small Consumer (PVPC) for consumers billed under the 2.0 TD tariff.",
			},
		);

		this.registerTools();
	}

	async start(transport: Transport): Promise<void> {
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
							"Get translations for sources. Accepted values: `es`, `en`. Defaults to `es`.",
						),
					startDate: z
						.string()
						.default(startOfToday().toISOString())
						.describe(
							"Beginning of the date range to filter indicator values in iso8601 format. E.g. 2025-06-29T00:00:00.000+02:00. Defaults to the start of today.",
						),
					endDate: z
						.string()
						.default(endOfToday().toISOString())
						.describe(
							"End of the date range to filter indicator values in iso8601 format. E.g. 2025-06-29T23:59:59.999+02:00. Defaults to the end of today.",
						),
					timeAggregation: z
						.enum(["sum", "average"])
						.default("sum")
						.describe(
							"How to aggregate indicator values when grouping them by time. Accepted values: `sum`, `average`. Defaults to `sum`.",
						),
					timeTruncation: z
						.enum(["hour", "day", "month", "year"])
						.optional()
						.describe(
							"Tells how to truncate data time series. Accepted values: `hour`, `day`, `month`, `year`.",
						),
					geographicalAggregation: z
						.enum(["sum", "average"])
						.default("sum")
						.describe(
							"How to aggregate indicator values when grouping them by geographical ID. Accepted values: `sum`, `average`. Defaults to `sum`.",
						),
					geographicalIds: z
						.array(z.number())
						.default([8741, 8742, 8743, 8744, 8745])
						.describe(
							"Tells the geographical IDs to filter indicator values. Accepted values: `3` (España), `8741` (Península), `8742` (Canarias), `8743` (Baleares), `8744` (Ceuta), `8745` (Melilla). Defaults to `8741`, `8742`, `8743`, `8744`, `8745`.",
						),
					geographicalTruncation: z
						.enum(["country", "electric_system"])
						.optional()
						.describe(
							"Tells how to group data at geographical level when the geographical aggregation is informed. Accepted values: `country`, `electric_system`.",
						),
				},
				outputSchema: {
					prices: z.array(
						z.object({
							price: z.object({
								amount: z.number(),
								currencyCode: z.string(),
								currencySymbol: z.string(),
							}),
							magnitude: z.string(),
							datetime: z.string(),
							datetimeUtc: z.string(),
							geographicalId: z.number(),
							geographicalName: z.string(),
							updatedAt: z.string(),
						}),
					),
				},
			},
			async ({
				locale,
				startDate,
				endDate,
				timeAggregation,
				timeTruncation,
				geographicalAggregation,
				geographicalIds,
				geographicalTruncation,
			}) => {
				try {
					const prices = await this.apiClient.fetchPrices({
						locale,
						startDate,
						endDate,
						timeAggregation,
						timeTruncation,
						geographicalAggregation,
						geographicalIds,
						geographicalTruncation,
					});

					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({ prices }, null, 2),
							},
						],
						structuredContent: {
							prices,
						},
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
