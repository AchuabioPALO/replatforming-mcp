---
mode: agent
---

# n8n Codebase Integration for MCP Server

## Task
Add two tools to the replatforming MCP server that connect to n8n's codebase endpoints for code analysis and modernization insights.

## API Details
**Common Configuration:**
- **Method**: POST
- **Auth**: Basic Auth (`sit_ai_day` / `count_ai_2025`)
- **Request/Response Format**: Same for both endpoints

**Endpoints:**
1. **RAG Endpoint**: `https://n8n.paloitcloud.com.sg/webhook/codebase-rag`
2. **Graph Endpoint**: `https://n8n.paloitcloud.com.sg/webhook/codebase-graph`

**Request Format:**
```json
{  
    "query":"How many i's are there in strawberry?"
}
```

**Response Format:**
```json
{
    "response": "Please provide your specific query or request so I can assist you better."
}
```

## Implementation Requirements

### 1. Replace Example Tool
Replace the current `example_tool` in `src/index.ts` with two new tools:

```typescript
// RAG Tool
server.tool(
  "query_codebase_rag",
  "Query the RAG system for code replatforming and modernization insights",
  {
    query: z.string().describe("Question about code replatforming, migration, or modernization")
  },
  async ({ query }) => {
    // Implementation for RAG endpoint
  }
);

// Graph Tool  
server.tool(
  "query_codebase_graph",
  "Query the graph system for code structure analysis and relationships",
  {
    query: z.string().describe("Question about code structure, dependencies, or relationships")
  },
  async ({ query }) => {
    // Implementation for Graph endpoint
  }
);
```

### 2. HTTP Implementation
- Use built-in `fetch` (Node 18+)
- Basic Auth: `Buffer.from('sit_ai_day:count_ai_2025').toString('base64')`
- 30-second timeout with AbortController
- Handle HTTP errors (401, 429, 5xx) and network failures
- **Create shared helper function** for common HTTP logic

### 3. Shared Helper Function
Create a reusable function for both tools:
```typescript
async function queryN8nEndpoint(endpoint: string, query: string) {
  // Shared implementation for both endpoints
}
```

### 4. Response Format
Both tools return MCP-compatible response:
```typescript
return {
  content: [
    {
      type: "text",
      text: data.response || "No response received"
    }
  ]
};
```

### 5. Error Handling
- Catch and log errors to stderr (not stdout)
- Return user-friendly error messages
- Handle JSON parsing failures
- Validate input query length

### 6. Testing
- Build with `npm run build`
- Test with MCP Inspector using `npm run inspector`
- Verify both tools appear and function correctly
- Test both endpoints with sample queries

## Success Criteria
- Both tools query their respective n8n endpoints successfully
- Proper error handling for network/auth failures
- Both tools visible in MCP Inspector
- Responses formatted correctly for MCP clients
- Code reuse through shared helper function

## Example Usage
**RAG Tool**: "How to migrate from Express to Fastify?"
**Graph Tool**: "Show me the dependency graph for this React component"
Expected: Relevant insights from respective systems