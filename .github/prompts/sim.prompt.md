---
mode: agent
---

# Multi-Agent Simulation - Execution Plan

## 🎯 Objective
Simulate 10 concurrent agents using the MCP server tools and display their activity in the dashboard.

## 📋 Implementation Steps

### 1. Create Multi-Agent Test Script
**File**: `test-multi-agent.js`

```javascript
#!/usr/bin/env node

import { AgentTracker } from './build/services/agent-tracker.js';

const tracker = new AgentTracker();
tracker.initializeWebSocket(8080);

// Simple agent personas
const QUERIES = [
  'How to migrate Express to Fastify?',
  'Show me dependency graph for microservices',
  'Analyze coupling between components',
  'Migration strategies for React components',
  'Database modernization approaches'
];

const TOOLS = ['query_codebase_rag', 'query_codebase_graph'];

// Simulate single agent
async function simulateAgent(agentId) {
  const session = tracker.createSession(agentId);
  
  // Random queries (1-3 per agent)
  const queryCount = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < queryCount; i++) {
    const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
    
    // Start tool call
    const traceId = tracker.startToolCall(session, tool, query);
    
    // Simulate progress
    const duration = Math.random() * 4 + 1; // 1-5 seconds
    
    setTimeout(() => {
      tracker.updateToolProgress(session, traceId, 50, 'Processing...');
    }, duration * 300);
    
    setTimeout(() => {
      tracker.completeToolCall(session, traceId, 'Response completed', duration, true);
    }, duration * 1000);
    
    // Wait between queries
    await new Promise(resolve => setTimeout(resolve, duration * 1000 + 500));
  }
}

// Launch 10 agents
async function runSimulation() {
  console.error('🚀 Starting 10-agent simulation...');
  console.error('📊 Dashboard: http://localhost:3001');
  
  for (let i = 1; i <= 10; i++) {
    const agentId = `agent-${i.toString().padStart(2, '0')}`;
    setTimeout(() => {
      console.error(`🤖 Starting ${agentId}`);
      simulateAgent(agentId);
    }, i * 2000); // Stagger by 2 seconds
  }
}

runSimulation();

// Keep running
process.on('SIGINT', () => {
  console.error('Stopping simulation...');
  tracker.shutdown();
  process.exit(0);
});
```

### 2. Update package.json
Add script:
```json
{
  "scripts": {
    "test-10-agents": "npm run build && node test-multi-agent.js"
  }
}
```

### 3. Test Execution
```bash
# Terminal 1: Start MCP + Dashboard
npm run inspector

# Terminal 2: Start Dashboard  
cd dashboard && npm run dev

# Terminal 3: Run 10 agents
npm run test-10-agents
```

## 📊 Expected Results

### Dashboard Should Show:
- [ ] 10 different agent timelines
- [ ] Agent IDs: agent-01, agent-02, ... agent-10
- [ ] Real-time progress updates
- [ ] Metrics: Active Agents count up to 10
- [ ] Tool usage: Mix of RAG and Graph queries
- [ ] Agents transition from Active → Idle

### Console Output:
```
� Starting 10-agent simulation...
📊 Dashboard: http://localhost:3001
🤖 Starting agent-01
🤖 Starting agent-02
...
🤖 Starting agent-10
```

## ✅ Success Criteria
- 10 agent sessions visible in dashboard
- Real-time updates working
- No UI lag or crashes
- WebSocket connection stable
- Metrics update correctly