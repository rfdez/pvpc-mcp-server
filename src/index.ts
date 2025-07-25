#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Command, Option } from "commander";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { PvpcMcpServer } from "./mcp.js";
import { PvpcApiClient } from "./pvpc.js";

async function main() {
	const program = new Command()
		.addOption(
			new Option("--transport <type>", "transport type")
				.choices(["stdio", "http"])
				.default("stdio"),
		)
		.option("--port [number]", "port for HTTP transport", "8080")
		.allowUnknownOption()
		.parse(process.argv);

	const options = program.opts<{
		transport: "stdio" | "http";
		port: string;
		[option: string]: unknown;
	}>();

	if (options.transport !== "http") {
		await runHttpServer(parseInt(options.port, 10));
	} else {
		await runStdioServer();
	}
}

main().catch((error) => {
	console.error("Server error:", error);

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

async function runHttpServer(port: number) {
	const apiClient = new PvpcApiClient();
	const mcpServer = new PvpcMcpServer(apiClient);

	const app = express();

	app.use(express.json());
	app.use(
		cors({
			origin: "*",
			methods: ["GET", "POST", "OPTIONS", "DELETE"],
			allowedHeaders: [
				"Content-Type",
				"MCP-Session-Id",
				"mcp-session-id",
			],
		}),
	);

	app.post("/mcp", async (req: Request, res: Response) => {
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
		});

		await mcpServer.start(transport);

		await transport.handleRequest(req, res, req.body);
	});

	app.get("/mcp", (_req: Request, res: Response) => {
		res.status(405).json({
			jsonrpc: "2.0",
			id: null,
			error: {
				code: -32000,
				message: "Method not allowed.",
			},
		});
	});

	app.delete("/mcp", (_req: Request, res: Response) => {
		res.status(405).json({
			jsonrpc: "2.0",
			id: null,
			error: {
				code: -32000,
				message: "Method not allowed.",
			},
		});
	});

	const httpServer = app.listen(port, "0.0.0.0", () => {
		console.error(`Server is running on http://localhost:${port}/mcp`);
	});

	process.on("SIGINT", () => {
		httpServer.close();

		process.exit(0);
	});

	process.on("SIGTERM", () => {
		httpServer.close((err) => {
			if (err) {
				console.error("Error closing server:", err);

				process.exit(1);
			}

			process.exit(0);
		});
	});
}

async function runStdioServer() {
	const apiClient = new PvpcApiClient();
	const mcpServer = new PvpcMcpServer(apiClient);

	await mcpServer.start(new StdioServerTransport());

	console.error("Server running on stdio");

	process.on("SIGINT", async () => {
		await mcpServer.stop();

		process.exit(0);
	});

	process.on("SIGTERM", async () => {
		try {
			await mcpServer.stop();
		} catch (error) {
			console.error("Error stopping server:", error);

			process.exit(1);
		}

		process.exit(0);
	});
}
