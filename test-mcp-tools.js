#!/usr/bin/env node

/**
 * Test client to connect to MCP server via stdio and trigger tools
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';

async function testMCPTools() {
  console.log('Testing MCP server tools with dashboard integration...');
  
  // Spawn the MCP server process
  const mcpServer = spawn('node', ['./build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Send initialization request
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {
        roots: {
          listChanged: true
        }
      },
      clientInfo: {
        name: "test-client",
        version: "1.0.0"
      }
    }
  };

  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');

  // Wait a bit for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send a tool call request
  const toolRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "query_codebase_rag",
      arguments: {
        query: "How to migrate from Express to Fastify?",
        agentId: "test-client-001"
      }
    }
  };

  console.log('Sending RAG tool request...');
  mcpServer.stdin.write(JSON.stringify(toolRequest) + '\n');

  // Listen for responses
  mcpServer.stdout.on('data', (data) => {
    console.log('MCP Response:', data.toString());
  });

  mcpServer.stderr.on('data', (data) => {
    console.log('MCP Error/Log:', data.toString());
  });

  // Keep running for a while
  setTimeout(() => {
    console.log('Test complete. Check dashboard at http://localhost:3001');
    mcpServer.kill();
    process.exit(0);
  }, 10000);
}

testMCPTools().catch(console.error);
