# MCP Inspector Guide

The MCP Inspector is a powerful web-based tool for testing and debugging your replatforming MCP server.

## Quick Start

### Launch the Inspector

1. **Using npm script**:
   ```bash
   npm run inspector
   ```

2. **Using VS Code Task**:
   - Open Command Palette (`Cmd+Shift+P`)
   - Run "Tasks: Run Task"
   - Select "Launch MCP Inspector"

3. **Manual launch**:
   ```bash
   npm run build && npx @modelcontextprotocol/inspector node build/index.js
   ```

### Accessing the Inspector

The inspector automatically opens in your browser at:
```
http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=<auth-token>
```

The authentication token is automatically generated and included in the URL.

## Features

### 🛠️ Tool Testing
- Test all available MCP tools
- Send custom parameters to tools
- View tool responses and errors
- Real-time execution feedback

### 📡 Protocol Inspection
- View all MCP protocol messages
- Inspect request/response pairs
- Debug communication issues
- Monitor server capabilities

### 🔍 Server Information
- View server metadata
- Check available tools and their schemas
- Inspect resources and prompts
- Validate server configuration

### 🐛 Debugging
- Error message inspection
- Performance monitoring
- Connection status
- Server logs integration

## Using with Your Replatforming Tools

When you add replatforming tools to your server, the inspector will automatically detect them:

1. **Add tools** to `src/index.ts` using `server.tool()`
2. **Rebuild** the server with `npm run build`
3. **Restart** the inspector
4. **Test** your new tools in the web interface

### Example Testing Workflow

1. Launch inspector: `npm run inspector`
2. Navigate to the "Tools" section
3. Select your replatforming tool
4. Enter test parameters (code snippet, target platform, etc.)
5. Execute and review results
6. Debug any issues using the protocol inspector

## Troubleshooting

### Port Conflicts
If you get port conflicts:
- Kill existing inspector: `pkill -f "@modelcontextprotocol/inspector"`
- Try different port: `PORT=3001 npm run inspector`

### Server Not Found
- Ensure server is built: `npm run build`
- Check server file exists: `ls build/index.js`
- Verify server starts: `npm start`

### Authentication Issues
- Use the full URL with auth token from terminal output
- Or disable auth: `DANGEROUSLY_OMIT_AUTH=true npm run inspector`

## Advanced Usage

### Custom Configuration
Create a config file for the inspector:

```json
{
  "servers": {
    "replatforming": {
      "command": "node",
      "args": ["./build/index.js"],
      "env": {
        "DEBUG": "mcp:*"
      }
    }
  }
}
```

### Environment Variables
- `PORT` - Set inspector port
- `DANGEROUSLY_OMIT_AUTH` - Disable authentication
- `DEBUG` - Enable debug logging

## Next Steps

Once your tools are working in the inspector:
1. Test with Claude Desktop using `claude_desktop_config.json`
2. Deploy to production environments
3. Create integration tests
4. Document your replatforming workflows
