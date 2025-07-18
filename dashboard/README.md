# Agent Status Dashboard

A real-time monitoring dashboard for AI agents using the MCP (Model Context Protocol) server tools.

## Features

✅ **Real-time Agent Timeline Tracking**
- Visual timeline showing agent progress with color-coded status
- Thinking 🔵, Tool calls 🟡, Success 🟢, Error 🔴
- Progress bars for active tool calls  
- Expandable nodes with query/response details

✅ **Basic Metrics Dashboard**
- Tool usage statistics (RAG vs Graph queries)
- Response times and success/failure rates
- Active agent count
- Real-time updates via WebSocket

✅ **Live WebSocket Connection**
- Real-time updates from MCP server
- Automatic reconnection on connection loss
- Connection status indicator

## Tech Stack

- **Backend**: Enhanced MCP server with Langfuse tracking
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Real-time**: WebSocket for live updates  
- **Database**: Langfuse for trace storage and persistence

## Quick Start

### 1. Start the MCP Server
```bash
cd /Users/achuabiopalo-it.com/replatforming-mcp
npm run build
npm start
```

The MCP server will start with:
- MCP protocol on stdio 
- WebSocket server on `ws://localhost:8080` for dashboard updates

### 2. Start the Dashboard
```bash
cd /Users/achuabiopalo-it.com/replatforming-mcp/dashboard
npm run dev
```

The dashboard will be available at `http://localhost:3001`

### 3. Test Agent Activity

Use the MCP tools to generate agent activity:

```typescript
// Example tool calls that will appear in the dashboard
await server.call("query_codebase_rag", { 
  query: "How to migrate Express to Fastify?",
  agentId: "agent-123" // Optional for tracking
});

await server.call("query_codebase_graph", { 
  query: "Show me the dependency graph",
  agentId: "agent-123"
});
```

## Environment Variables

For Langfuse integration (optional):

```bash
export LANGFUSE_PUBLIC_KEY="pk_..."
export LANGFUSE_SECRET_KEY="sk_..."
export LANGFUSE_BASE_URL="https://cloud.langfuse.com"
```

## Timeline Example

```
🤖 Agent-abc12345    [ACTIVE]
├─ 14:30:15 🔵 Analyzing query: "Migrate Express to Fastify"
├─ 14:30:16 🟡 Calling query_codebase_rag...     [████████░░] 80%
├─ 14:30:18 🟢 RAG response (2.1s)
└─ 14:30:19 🟡 Calling query_codebase_graph...   [███░░░░░░░] 30%
```

## Implementation Details

### Agent Tracking
- Each agent session is tracked with a unique ID
- Events are logged with timestamps, types, and metadata
- Progress updates are sent in real-time via WebSocket
- Session cleanup after 1 hour of inactivity

### Dashboard Components
- `AgentTimeline`: Shows chronological events for each agent
- `MetricsCard`: Displays key performance indicators  
- `useWebSocket`: Custom hook for real-time WebSocket connection

### Data Flow
1. MCP tools create agent sessions and track events
2. Events are sent to Langfuse for persistence
3. Real-time updates broadcasted via WebSocket
4. Dashboard receives updates and updates UI immediately

## Next Steps

- [ ] Add more detailed charts and analytics
- [ ] Implement agent filtering and search
- [ ] Add export functionality for session data
- [ ] Create agent performance comparison views
- [ ] Add alerting for failed agents
