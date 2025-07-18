# 10-Agent Simulation Guide

## Quick Setup

### 0. Clean Ports (If Having Issues)
```bash
# Clean up any hanging processes first
npm run cleanup
```

### 1. Start MCP Server + Dashboard
```bash
# Terminal 1: Start MCP Inspector (includes WebSocket server)
npm run inspector

# Terminal 2: Start Dashboard
cd dashboard && npm run dev
```

### 2. Run 10-Agent Simulation
```bash
# Terminal 3: Run simulation (auto-cleans ports first)
npm run test-10-agents
```

## What You'll See

### Dashboard (http://localhost:3001)
- **10 Agent Timelines**: agent-01, agent-02, ... agent-10
- **Real-time Progress**: Progress bars updating from 0% → 100%
- **Active Agents**: Count updating in real-time as agents start/complete work
- **Total Requests**: Counter incrementing with each tool call
- **Success Rate**: Updating live based on completed vs failed requests (~90%)
- **Tool Usage**: RAG vs Graph counters and progress bars updating live

### Console Output
```
🚀 Starting 10-agent simulation...
📊 Dashboard: http://localhost:3001
🔧 MCP Inspector: http://localhost:6274

🤖 Starting agent-01
🤖 Starting agent-02
...
🤖 Starting agent-10

📈 Active Agents: 8 | Total Requests: 15 | Success Rate: 93.3%
```

## Agent Behavior

Each agent:
- Starts with 2-second delays between agents
- Runs 1-3 random queries
- Uses either RAG or Graph tools randomly
- Takes 1-5 seconds per query
- Has 90% success rate (10% simulated failures)

## Stopping
Press `Ctrl+C` to stop and see final statistics.

## Troubleshooting

### Port Issues (Most Common Problem)

**"Port 8080 is already in use"** - This happens when previous processes didn't shut down properly.

**Quick Fix:**
```bash
# Clean all MCP ports automatically
npm run cleanup
```

**Manual Fix:**
```bash
# Kill specific processes
lsof -ti:8080 | xargs kill -9  # WebSocket server
lsof -ti:6274 | xargs kill -9  # MCP Inspector  
lsof -ti:3001 | xargs kill -9  # Dashboard
```

**Prevention:**
- Always use `Ctrl+C` to stop processes properly
- Run `npm run cleanup` before starting new tests
- The `test-10-agents` script now auto-cleans ports

### Other Issues

**Dashboard not updating**
- Refresh browser page
- Check WebSocket connection status in dashboard
- Verify MCP Inspector is running

**No agents visible**
- Wait a few seconds for agents to start
- Check console for errors
- Ensure dashboard is running on port 3001
