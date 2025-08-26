#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Command, Option } from "commander";
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { PvpcMcpServer } from "./mcp.js";
import { PvpcApiClient } from "./pvpc.js";
import { extractBearerToken, extractHeaderValue } from "./utils.js";

const program = new Command()
	.addOption(
		new Option("--transport <type>", "transport type")
			.choices(["stdio", "http"])
			.default("stdio"),
	)
	.addOption(
		new Option("--port <number>", "port for HTTP transport")
			.implies({ transport: "http" })
			.env("PORT")
			.default("8080"),
	)
	.addOption(
		new Option("--api-key <key>", "ESIOS API key for authentication")
			.implies({ transport: "stdio" })
			.conflicts("port")
			.env("ESIOS_API_KEY"),
	)
	.allowUnknownOption() // let MCP Inspector / other wrappers pass through extra flags
	.parse(process.argv);

const options = program.opts<{
	transport: "stdio" | "http";
	port: string;
	apiKey?: string;
	[option: string]: unknown;
}>();

async function main() {
	if (options.transport === "http") {
		const defaultPort = 8080;
		const port = parseInt(options.port, 10);

		await runHttpServer(isNaN(port) ? defaultPort : port);
	} else {
		await runStdioServer(options.apiKey);
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
	const app = express();

	app.use(express.json());
	app.use(helmet());
	app.use(
		cors({
			origin: "*",
			methods: ["GET", "POST", "OPTIONS", "DELETE"],
			exposedHeaders: ["Mcp-Session-Id"],
			allowedHeaders: ["Content-Type", "mcp-session-id"],
		}),
	);
	app.use(
		pinoHttp({
			transport:
				process.env.NODE_ENV === "development"
					? {
							target: "pino-pretty",
							options: {
								colorize: true,
							},
						}
					: undefined,
			redact: {
				paths: [
					"req.headers",
					"res.headers",
					"req.remoteAddress",
					"req.remotePort",
				],
				remove: true,
			},
		}),
	);

	app.post("/mcp", async (req: Request, res: Response) => {
		try {
			// Check headers in order of preference
			const apiKey =
				extractBearerToken(req.headers.authorization) ||
				extractHeaderValue(req.headers["Esios-API-Key"]) ||
				extractHeaderValue(req.headers["X-API-Key"]) ||
				extractHeaderValue(req.headers["esios-api-key"]) ||
				extractHeaderValue(req.headers["x-api-key"]) ||
				extractHeaderValue(req.headers["Esios_API_Key"]) ||
				extractHeaderValue(req.headers["X_API_Key"]) ||
				extractHeaderValue(req.headers["esios_api_key"]) ||
				extractHeaderValue(req.headers["x_api_key"]);

			const apiClient = new PvpcApiClient(apiKey);
			const mcpServer = new PvpcMcpServer(apiClient);
			const transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined,
			});

			res.on("close", async () => {
				await transport.close();
				await mcpServer.stop();
			});

			await mcpServer.start(transport);

			await transport.handleRequest(req, res, req.body);
		} catch (error) {
			console.error("Error handling MCP request:", error);

			if (!res.headersSent) {
				res.status(500).json({
					jsonrpc: "2.0",
					id: null,
					error: {
						code: -32603,
						message: "Internal server error.",
					},
				});
			}
		}
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

	const httpServer = app.listen(port, () => {
		console.log(`Server is running on http://localhost:${port}/mcp`);
	});

	process.on("SIGINT", () => {
		httpServer.close();

		process.exit(0);
	});

	process.on("SIGTERM", () => {
		httpServer.close((err) => {
			if (err) {
				console.error("Error closing HTTP server:", err);

				process.exit(1);
			}

			process.exit(0);
		});
	});
}

async function runStdioServer(apiKey?: string) {
	const apiClient = new PvpcApiClient(apiKey);
	const mcpServer = new PvpcMcpServer(apiClient);

	const transport = new StdioServerTransport();
	await mcpServer.start(transport);

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
