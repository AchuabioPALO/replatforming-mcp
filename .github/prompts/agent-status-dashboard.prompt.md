```prompt
---
mode: agent
---
# Agent Status Dashboard

## Objective
Build a simple dashboard to monitor AI agents using the MCP server tools with real-time timeline tracking.

## Core Features

### 📊 **Agent Timeline Component**
- Real-time visual timeline showing agent progress
- Color-coded status: thinking 🔵, calling tools 🟡, success 🟢, error 🔴
- Progress bars for active tool calls
- Expandable nodes with query/response details

### 📈 **Basic Metrics**
- Tool usage (RAG vs Graph)
- Response times
- Success/failure rates
- Active agent count

## Tech Stack
- **Frontend**: React/Next.js dashboard
- **Backend**: Add Langfuse SDK to MCP server
- **Real-time**: WebSocket for live updates
- **Database**: Langfuse for trace storage

## Timeline Example
```
🤖 Agent-abc123    [Active]
├─ 14:30:15 🔵 Analyzing query: "Migrate Express to Fastify"
├─ 14:30:16 🟡 Calling query_codebase_rag...     [████████░░] 80%
├─ 14:30:18 🟢 RAG response (2.1s)
└─ 14:30:19 🟡 Calling query_codebase_graph...   [███░░░░░░░] 30%
```

## Implementation Steps
1. Add Langfuse to MCP server for tracking
2. Build React dashboard with timeline component
3. Add WebSocket for real-time updates
4. Create simple metrics charts

## Data Structure
```typescript
interface AgentEvent {
  agentId: string;
  timestamp: Date;
  type: "thinking" | "tool_call" | "response" | "error";
  toolName?: "query_codebase_rag" | "query_codebase_graph";
  message: string;
  duration?: number;
  progress?: number; // 0-100 for in-progress
}
```

Keep it simple, focused on the timeline visualization and basic monitoring.
```
