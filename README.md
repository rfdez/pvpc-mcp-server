# Voluntary Price for the Small Consumer (PVPC) MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/%40rfdez%2Fpvpc-mcp-server)](https://www.npmjs.com/package/@rfdez/pvpc-mcp-server)
[![smithery badge](https://smithery.ai/badge/@rfdez/pvpc-mcp-server)](https://smithery.ai/server/@rfdez/pvpc-mcp-server)

Fetch the Voluntary Price for the Small Consumer (PVPC) published daily by Red Eléctrica at 8:15 p.m. This includes the hourly electricity tariffs that will apply the following day for consumers billed under the 2.0 TD tariff.

## Components

### Tools

- `fetch_prices`: Fetches the Voluntary Price for the Small Consumer (PVPC) prices for a given date range and geographical area.
  - Inputs:
    - `locale`: Defines the response language. Accepted values: `es`, `en`. Defaults to `es`.
    - `startDate`: Defines the starting date in iso8601 format. E.g. 2025-06-29T00:00:00.000+02:00. Defaults to the start of today.
    - `endDate`: Defines the ending date in iso8601 format. E.g. 2025-06-29T23:59:59.999+02:00. Defaults to the end of today.
    - `timeTrunc`: Defines the time aggregation of the requested data. Accepted values: `five_minutes`, `ten_minutes`, `fifteen_minutes`, `hour`, `day`, `month`, `year`. Defaults to `hour`.
    - `geoIds`: Defines the geographical IDs to filter the prices. Available IDs: 8741 (Península), 8742 (Canarias), 8743 (Baleares), 8744 (Ceuta), 8745 (Melilla). Defaults to all available geographical IDs.
  - Returns: Text content with the PVPC prices in JSON format.

## Configuration

### Requirements

You need to register an API key from [Esios Red Eléctrica de España](https://www.esios.ree.es/es/pagina/api) to access the Esios Red Eléctrica de España API. Once you have the API key, set it in your environment variables as `ESIOS_API_KEY`.

You will find the API documentation at [API e·sios Documentation](https://api.esios.ree.es/).

### Smithery

To install PVPC MCP Server for any client automatically via [Smithery](https://smithery.ai/server/@rfdez/pvpc-mcp-server):

```bash
npx -y @smithery/cli@latest install @rfdez/pvpc-mcp-server --client <CLIENT_NAME> --profile <YOUR_SMITHERY_PROFILE> --key <YOUR_SMITHERY_KEY>
```

You can find your Smithery profile and key in the [Smithery.ai webpage](https://smithery.ai/server/@rfdez/pvpc-mcp-server).

### Claude Desktop

Add this to your Claude Desktop `claude_desktop_config.json` file. See [Claude Desktop MCP docs](https://modelcontextprotocol.io/quickstart/user) for more info.

```json
{
  "mcpServers": {
    "pfm": {
      "command": "npx",
      "args": ["-y", "@rfdez/pvpc-mcp-server@latest"],
      "env": {
        "ESIOS_API_KEY": "your_esios_api_key"
      }
    }
  }
}
```

## Development

If you are doing local development, there are two ways to test your changes:

1. Run the MCP inspector to test your changes. See [Debugging](#debugging) for run instructions.
2. Test using the Claude desktop app. Add the following to your `claude_desktop_config.json`:

### Docker

You need to build the Docker image first:

```bash
docker build -t pvpc-mcp-server .
```

```json
{
  "mcpServers": {
    "pvpc": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "pvpc-mcp-server"
      ],
      "env": {
        "ESIOS_API_KEY": "your_esios_api_key"
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "pvpc": {
      "command": "npx",
      "args": [
        "-y",
        "@rfdez/pvpc-mcp-server@latest"
      ],
      "env": {
        "ESIOS_API_KEY": "your_esios_api_key"
      }
    }
  }
}
```

## Debugging

You can use the MCP inspector to debug the server. For npx installations:

```bash
npx -y @modelcontextprotocol/inspector npx -y @rfdez/pvpc-mcp-server@latest
```

Or if you are developing on it:

```bash
cd path/to/pvpc-mcp-server
npm run build:watch
npx -y @modelcontextprotocol/inspector node --watch --env-file=.env dist/index.js
```

Remember to set the `ESIOS_API_KEY` environment variable before connecting to the MCP Server in the MCP inspector.

Running `tail -n 20 -f ~/Library/Logs/Claude/mcp*.log` will show the logs from the server and may help you debug any issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
