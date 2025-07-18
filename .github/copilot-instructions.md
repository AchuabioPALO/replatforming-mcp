<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Replatforming MCP Server

This is an MCP (Model Context Protocol) server designed for replatforming and code modernization tasks and unserstanding them. The server is built with TypeScript and can be extended to connect to n8n endpoints or other APIs to assist with application modernization and migration projects.

## Key Guidelines

- You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt
- This is an MCP server that follows the stdio transport protocol
- When adding tools, use proper Zod schema validation for parameters
- Always log to stderr (console.error) not stdout to avoid interfering with MCP protocol
- The server is designed to be extensible for replatforming tasks like:
  - Code analysis and modernization
  - API migration assistance
  - Database schema transformation
  - Integration with n8n workflows
  - Legacy system assessment

## Architecture

- **TypeScript** with strict typing
- **MCP SDK** for protocol implementation
- **Zod** for schema validation
- **ES modules** configuration
- **STDIO transport** for communication

## Future Extensions

This server is designed to be extended with tools for:
- Connecting to n8n workflow endpoints and querying APIs
- API analysis and migration tools
- Code pattern detection and transformation
- Legacy system documentation generation
- Migration planning assistance
