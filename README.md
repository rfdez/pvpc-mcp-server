# Voluntary Price for the Small Consumer (PVPC) MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/%40rfdez%2Fpvpc-mcp-server)](https://www.npmjs.com/package/@rfdez/pvpc-mcp-server)
[![smithery badge](https://smithery.ai/badge/@rfdez/pvpc-mcp-server)](https://smithery.ai/server/@rfdez/pvpc-mcp-server)

Fetch the Voluntary Price for the Small Consumer (PVPC) published daily by Red Eléctrica at 8:15 p.m. This includes the hourly electricity tariffs that will apply the following day for consumers billed under the 2.0 TD tariff.

## 🧩 Components

### Tools

- `fetch_prices`: Fetches the Voluntary Price for the Small Consumer (PVPC) prices for a given date range and geographical area.
  - Inputs:
    - `locale`: Get translations for sources. Accepted values: `es`, `en`. Defaults to `es`.
    - `startDate`: Beginning of the date range to filter indicator values in iso8601 format. E.g. 2025-06-29T00:00:00.000+02:00. Defaults to the start of today.
    - `endDate`: End of the date range to filter indicator values in iso8601 format. E.g. 2025-06-29T23:59:59.999+02:00. Defaults to the end of today.
    - `timeAggregation`: How to aggregate indicator values when grouping them by time. Accepted values: `sum`, `average`. Defaults to `sum`.
    - `timeTruncation`: Tells how to truncate data time series. Accepted values: `hour`, `day`, `month`, `year`. Optional parameter.
    - `geographicalAggregation`: How to aggregate indicator values when grouping them by geographical ID. Accepted values: `sum`, `average`. Defaults to `sum`.
    - `geographicalIds`: Tells the geographical IDs to filter indicator values. Accepted values: `3` (España), `8741` (Península), `8742` (Canarias), `8743` (Baleares), `8744` (Ceuta), `8745` (Melilla). Defaults to `8741`, `8742`, `8743`, `8744`, `8745`.
    - `geographicalTruncation`: Tells how to group data at geographical level when the geographical aggregation is informed. Accepted values: `country`, `electric_system`. Optional parameter.
  - Returns: Text content with the PVPC prices in JSON format.

## 🔧 Configuration

### Requirements

You need to register an API key from [Esios Red Eléctrica de España](https://www.esios.ree.es/es/pagina/api) to access the Esios Red Eléctrica de España API.

You will find the API documentation at [API e·sios Documentation](https://api.esios.ree.es/).

### Smithery

To install PVPC MCP Server for any client automatically via [Smithery](https://smithery.ai/server/@rfdez/pvpc-mcp-server):

```bash
npx -y @smithery/cli@latest install @rfdez/pvpc-mcp-server --client <CLIENT_NAME> --profile <YOUR_SMITHERY_PROFILE> --key <YOUR_SMITHERY_KEY>
```

You can find your Smithery profile and key in the [Smithery.ai webpage](https://smithery.ai/server/@rfdez/pvpc-mcp-server).

### Claude Desktop

#### Remote Server Connection

Open Claude Desktop and navigate to `Settings > Connectors > Add Custom Connector`. Enter the name as `PVPC` and the remote MCP server URL like `https://mcp.example.com/mcp`.

#### Local Server Connection

Add this to your Claude Desktop `claude_desktop_config.json` file. See [Claude Desktop MCP docs](https://modelcontextprotocol.io/quickstart/user) for more info.

```json
{
  "mcpServers": {
    "pvpc": {
      "command": "npx",
      "args": ["-y", "@rfdez/pvpc-mcp-server@latest", "--api-key", "your_esios_api_key"]
    }
  }
}
```

## 💻 Development

Clone this repository and install the dependencies:

```bash
npm install
```

Build the project:

```bash
npm run build
```

Run the server:

```bash
node dist/index.js
```

### CLI Arguments

`pvpc-mcp-server` accepts the following CLI flags:

- `--transport <stdio|http>`: Transport to use (`stdio` by default).
- `--port <number>`: Port to listen on when using `http` transport (default `8080`).
- `--api-key <key>`: Your e·sios API key for authentication.

Example with http transport and port 8080:

```bash
node dist/index.js --transport http --port 8080
```

Example with stdio transport:

```bash
node dist/index.js --transport stdio --api-key YOUR_ESIOS_API_KEY
```

### Local Configuration Example

```json
{
  "mcpServers": {
    "pvpc": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/folder/pvpc-mcp-server/src/index.ts", "--api-key", "YOUR_ESIOS_API_KEY"]
    }
  }
}
```

### Testing with MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector npx -y @rfdez/pvpc-mcp-server
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
