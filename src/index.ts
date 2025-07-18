#!/usr/bin/env node

// Load environment variables from .env file
import 'dotenv/config';

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AgentTracker } from "./services/agent-tracker.js";

/**
 * Replatforming MCP Server with Agent Dashboard Monitoring
 * 
 * An MCP server for replatforming and code modernization tasks with real-time
 * agent monitoring capabilities. This server can be extended to connect to n8n 
 * endpoints or other APIs to assist with application modernization and migration projects.
 */

// Initialize agent tracker
const agentTracker = new AgentTracker();

// Initialize WebSocket server for dashboard
agentTracker.initializeWebSocket(8080);

// Create server instance
const server = new McpServer({
  name: "replatforming-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

/**
 * Shared helper function for querying n8n endpoints
 */
async function queryN8nEndpoint(endpoint: string, query: string) {
  // Validate input query length
  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }
  
  if (query.length > 10000) {
    throw new Error("Query too long (max 10000 characters)");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const credentials = Buffer.from('sit_ai_day:count_ai_2025').toString('base64');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ query: query.trim() }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      throw new Error("Authentication failed. Please check credentials.");
    }
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    
    if (response.status >= 500) {
      throw new Error(`Server error (${response.status}). Please try again later.`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error("Invalid response format. Expected JSON.");
    }

    const data = await response.json();
    
    if (typeof data !== 'object' || data === null) {
      throw new Error("Invalid JSON response structure");
    }

    return (data as any).response || "No response received";
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error("Request timeout after 30 seconds");
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error("Network error. Please check your connection.");
      }
      
      throw error;
    }
    
    throw new Error("An unknown error occurred");
  }
}

/**
 * RAG Tool - Query the RAG system for code replatforming and modernization insights
 */
server.tool(
  "query_codebase_rag",
  "Query the RAG system for code replatforming and modernization insights",
  {
    query: z.string().describe("Question about code replatforming, migration, or modernization"),
    agentId: z.string().optional().describe("Optional agent ID for tracking")
  },
  async ({ query, agentId }) => {
    const sessionId = agentId || agentTracker.createSession();
    const startTime = Date.now();
    
    try {
      console.error(`RAG Query: ${query}`);
      
      // Track thinking phase
      agentTracker.trackEvent(sessionId, {
        type: 'thinking',
        message: `Analyzing query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`
      });
      
      // Start tool call tracking
      const traceId = agentTracker.startToolCall(sessionId, 'query_codebase_rag', query);
      
      // Simulate progress updates
      setTimeout(() => agentTracker.updateToolProgress(sessionId, traceId, 30, 'Processing query...'), 100);
      setTimeout(() => agentTracker.updateToolProgress(sessionId, traceId, 60, 'Searching knowledge base...'), 500);
      setTimeout(() => agentTracker.updateToolProgress(sessionId, traceId, 90, 'Generating response...'), 1000);
      
      const response = await queryN8nEndpoint(
        'https://n8n.paloitcloud.com.sg/webhook/codebase-rag',
        query
      );
      
      const duration = (Date.now() - startTime) / 1000;
      agentTracker.completeToolCall(sessionId, traceId, response, duration, true);
      
      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
      
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      console.error("RAG Query Error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      agentTracker.trackEvent(sessionId, {
        type: 'error',
        message: `RAG query failed: ${errorMessage}`,
        duration,
        metadata: { errorDetails: errorMessage }
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Error querying RAG system: ${errorMessage}`
          }
        ]
      };
    }
  }
);

/**
 * Graph Tool - Query the graph system for code structure analysis and relationships
 */
server.tool(
  "query_codebase_graph",
  "Query the graph system for code structure analysis and relationships",
  {
    query: z.string().describe("Question about code structure, dependencies, or relationships"),
    agentId: z.string().optional().describe("Optional agent ID for tracking")
  },
  async ({ query, agentId }) => {
    const sessionId = agentId || agentTracker.createSession();
    const startTime = Date.now();
    
    try {
      console.error(`Graph Query: ${query}`);
      
      // Track thinking phase
      agentTracker.trackEvent(sessionId, {
        type: 'thinking',
        message: `Analyzing query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`
      });
      
      // Start tool call tracking
      const traceId = agentTracker.startToolCall(sessionId, 'query_codebase_graph', query);
      
      // Simulate progress updates
      setTimeout(() => agentTracker.updateToolProgress(sessionId, traceId, 25, 'Connecting to graph database...'), 100);
      setTimeout(() => agentTracker.updateToolProgress(sessionId, traceId, 50, 'Traversing code relationships...'), 400);
      setTimeout(() => agentTracker.updateToolProgress(sessionId, traceId, 80, 'Analyzing dependencies...'), 800);
      
      const response = await queryN8nEndpoint(
        'https://n8n.paloitcloud.com.sg/webhook/codebase-graph',
        query
      );
      
      const duration = (Date.now() - startTime) / 1000;
      agentTracker.completeToolCall(sessionId, traceId, response, duration, true);
      
      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
      
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      console.error("Graph Query Error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      agentTracker.trackEvent(sessionId, {
        type: 'error',
        message: `Graph query failed: ${errorMessage}`,
        duration,
        metadata: { errorDetails: errorMessage }
      });
      
      return {
        content: [
          {
            type: "text",
            text: `Error querying graph system: ${errorMessage}`
          }
        ]
      };
    }
  }
);

/**
 * Dashboard Tool - Get current agent metrics and sessions for monitoring
 */
server.tool(
  "get_agent_dashboard",
  "Get current agent metrics and sessions for the monitoring dashboard",
  {},
  async () => {
    try {
      const metrics = agentTracker.getMetrics();
      const sessions = agentTracker.getSessions();
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              metrics,
              sessions,
              timestamp: new Date().toISOString()
            }, null, 2)
          }
        ]
      };
      
    } catch (error) {
      console.error("Dashboard Query Error:", error);
      
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving dashboard data: ${error instanceof Error ? error.message : "Unknown error"}`
          }
        ]
      };
    }
  }
);

/**
 * Main function to start the MCP server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr (not stdout) to avoid interfering with MCP protocol
  console.error("Replatforming MCP Server with Agent Dashboard running on stdio");
  console.error("Dashboard WebSocket server available on ws://localhost:8080");
  
  // Set up cleanup interval for old sessions
  setInterval(() => {
    agentTracker.cleanup();
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down gracefully...');
  agentTracker.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  agentTracker.shutdown();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
