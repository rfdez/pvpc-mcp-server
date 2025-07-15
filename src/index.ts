#!/usr/bin/env node

import { PvpcMcpServer } from "./mcp.js";
import { PvpcApiClient } from "./pvpc.js";

async function main() {
	const apiClient = new PvpcApiClient();
	const server = new PvpcMcpServer(apiClient);

	await server.start();

	console.error("MCP Server is running on stdio");

	process.on("SIGINT", async () => {
		await server.stop();

		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		try {
			await server.stop();
		} catch (error) {
			console.error("Error stopping MCP server:", error);

			process.exit(1);
		}

		process.exit(0);
	});
}

main().catch((error) => {
	console.error("MCP server error:", error);

	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);

	process.exit(1);
});

process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error);

	process.exit(1);
});
