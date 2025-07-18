# Replatforming MCP Server with Agent Dashboard

An MCP (Model Context Protocol) server designed for replatforming and code modernization tasks, now with **real-time agent monitoring dashboard**. This server can be extended to connect to n8n endpoints or other APIs to assist with application modernization and migration projects.

## 🆕 Agent Status Dashboard

**NEW**: Real-time monitoring dashboard that tracks AI agent activity through a beautiful web interface with live timeline updates.

### Dashboard Features
- 📊 **Real-time Agent Timeline** - Visual timeline showing agent progress with color-coded status
- 📈 **Live Metrics** - Tool usage, response times, success rates, active agent count  
- 🔌 **WebSocket Updates** - Real-time updates with automatic reconnection
- 📋 **Detailed Event Logs** - Expandable nodes with query/response details
- 📚 **Langfuse Integration** - Persistent trace storage for analytics

### Quick Dashboard Start
```bash
# Terminal 1: Start MCP Server with Dashboard
npm run test-dashboard

# Terminal 2: Start Web Dashboard  
cd dashboard && npm run dev

# Open http://localhost:3001 to view the dashboard
```

## Overview

This MCP server provides a foundation for building tools that help with:
- Code analysis and modernization
- API migration assistance  
- Database schema transformation
- Integration with n8n workflows
- Legacy system assessment
- **Real-time agent monitoring and analytics**

## Quick Start

### Prerequisites
- Node.js 18 or higher
- TypeScript

### Installation

1. Clone and navigate to this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Test the server:
   ```bash
   npm start
   ```

### Development

- **Build**: `npm run build` - Compile TypeScript to JavaScript
- **Start**: `npm start` - Build and run the server
- **Dev mode**: `npm run dev` - Watch mode for development
- **Inspector**: `npm run inspector` - Launch MCP Inspector for testing and debugging

### Using the MCP Inspector

The MCP Inspector is a powerful tool for testing and debugging your MCP server. To launch it:

1. Run `npm run inspector` or use the VS Code task "Launch MCP Inspector"
2. The inspector will open in your browser automatically
3. You can test your tools, inspect capabilities, and debug interactions

The inspector provides:
- Tool testing interface
- Real-time MCP protocol inspection
- Error debugging
- Interactive testing environment

## Usage with Claude Desktop

To use this MCP server with Claude Desktop, add it to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "replatforming-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/replatforming-mcp/build/index.js"]
    }
  }
}
```

## Architecture

- **TypeScript** with strict typing
- **MCP SDK** for protocol implementation
- **Zod** for schema validation
- **ES modules** configuration
- **STDIO transport** for communication

## Extending the Server

This server is designed to be extended with additional tools. The current implementation includes:

- A basic example tool (to be replaced with actual replatforming tools)
- Proper error handling and logging
- Clean shutdown handling

### Adding New Tools

To add new tools, modify `src/index.ts` and use the `server.tool()` method:

```typescript
server.tool(
  "your_tool_name",
  "Description of what your tool does", 
  {
    param1: z.string().describe("Parameter description"),
    param2: z.number().describe("Another parameter")
  },
  async ({ param1, param2 }) => {
    // Your tool implementation here
    return {
      content: [
        {
          type: "text", 
          text: "Tool response"
        }
      ]
    };
  }
);
```

## Future Extensions

This server is designed to be extended with tools for:
- Connecting to n8n workflow endpoints
- API analysis and migration tools
- Code pattern detection and transformation
- Legacy system documentation generation
- Migration planning assistance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build and test
5. Submit a pull request

## License

ISC License
