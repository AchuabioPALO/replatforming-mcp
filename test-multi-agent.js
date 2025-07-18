#!/usr/bin/env node

/**
 * Simple 10-agent simulation for testing dashboard display
 */

import { AgentTracker } from './build/services/agent-tracker.js';

// Check if ports are available before starting
async function checkPorts() {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const lsof = spawn('lsof', ['-i', ':8080']);
    
    lsof.on('exit', (code) => {
      if (code === 0) {
        console.error('❌ Port 8080 is in use. Run: ./cleanup-ports.sh');
        process.exit(1);
      } else {
        resolve(true);
      }
    });
  });
}

// Check ports first
await checkPorts();

const tracker = new AgentTracker();

// Initialize WebSocket with error handling
try {
  tracker.initializeWebSocket(8080);
  console.error('✅ WebSocket server started on port 8080');
} catch (error) {
  console.error('❌ Failed to start WebSocket server:', error.message);
  console.error('Run: ./cleanup-ports.sh to clean up ports');
  process.exit(1);
}

// Simple queries for simulation
const QUERIES = [
  'How to migrate Express to Fastify?',
  'Show me dependency graph for microservices',
  'Analyze coupling between components',
  'Migration strategies for React components',
  'Database modernization approaches',
  'Convert REST API to GraphQL',
  'Modernize jQuery to React',
  'Migrate MongoDB to PostgreSQL',
  'Transform monolith to microservices',
  'Update legacy authentication system'
];

const TOOLS = ['query_codebase_rag', 'query_codebase_graph'];

// Simulate single agent
async function simulateAgent(agentId) {
  console.error(`🤖 Starting ${agentId}`);
  const session = tracker.createSession(agentId);
  
  // Random queries (1-3 per agent)
  const queryCount = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < queryCount; i++) {
    const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
    
    // Thinking phase
    tracker.trackEvent(session, {
      type: 'thinking',
      message: `Query ${i + 1}: ${query.substring(0, 40)}...`
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Start tool call
    const traceId = tracker.startToolCall(session, tool, query);
    
    // Simulate progress
    const duration = Math.random() * 4 + 1; // 1-5 seconds
    
    // Progress updates
    setTimeout(() => {
      tracker.updateToolProgress(session, traceId, 30, 'Initializing...');
    }, duration * 200);
    
    setTimeout(() => {
      tracker.updateToolProgress(session, traceId, 60, tool === 'query_codebase_rag' ? 'Searching knowledge base...' : 'Traversing graph...');
    }, duration * 500);
    
    setTimeout(() => {
      tracker.updateToolProgress(session, traceId, 90, 'Finalizing response...');
    }, duration * 800);
    
    // Complete tool call
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        tracker.completeToolCall(session, traceId, 'Query completed successfully', duration, true);
      } else {
        tracker.trackEvent(session, {
          type: 'error',
          message: 'Tool execution failed: Network timeout',
          duration,
          metadata: { query, traceId }
        });
      }
    }, duration * 1000);
    
    // Wait between queries
    await new Promise(resolve => setTimeout(resolve, duration * 1000 + 500));
  }
  
  console.error(`✅ ${agentId} completed ${queryCount} queries`);
}

// Launch 10 agents
async function runSimulation() {
  console.error('🚀 Starting 10-agent simulation...');
  console.error('📊 Dashboard: http://localhost:3001');
  console.error('🔧 MCP Inspector: http://localhost:6274');
  console.error('');
  
  const agents = [];
  
  for (let i = 1; i <= 10; i++) {
    const agentId = `agent-${i.toString().padStart(2, '0')}`;
    
    // Stagger agent starts by 2 seconds
    setTimeout(() => {
      agents.push(simulateAgent(agentId));
    }, i * 2000);
  }
  
  // Monitor progress
  setInterval(() => {
    const metrics = tracker.getMetrics();
    console.error(`📈 Active Agents: ${metrics.activeAgents} | Total Requests: ${metrics.totalRequests} | Success Rate: ${((metrics.successfulRequests / Math.max(metrics.totalRequests, 1)) * 100).toFixed(1)}%`);
  }, 10000);
}

runSimulation();

// Cleanup handler
process.on('SIGINT', () => {
  console.error('');
  console.error('🛑 Stopping simulation...');
  
  const metrics = tracker.getMetrics();
  const sessions = tracker.getSessions();
  
  console.error('📊 Final Stats:');
  console.error(`   Total Agents: ${sessions.length}`);
  console.error(`   Total Requests: ${metrics.totalRequests}`);
  console.error(`   Success Rate: ${((metrics.successfulRequests / Math.max(metrics.totalRequests, 1)) * 100).toFixed(1)}%`);
  console.error(`   RAG Queries: ${metrics.toolUsage.rag} | Graph Queries: ${metrics.toolUsage.graph}`);
  
  tracker.shutdown();
  process.exit(0);
});
