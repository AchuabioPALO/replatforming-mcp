# 🚀 Replatforming MCP Server - Launch Guide

This guide provides the exact step-by-step process to launch the MCP server with dashboard integration without port conflicts.

## 📋 Quick Overview

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Dashboard** | 3001 | http://localhost:3001 | Real-time agent monitoring UI |
| **MCP Inspector** | 6274 | http://localhost:6274 | MCP server testing interface |
| **WebSocket Server** | 8080 | ws://localhost:8080 | Real-time data sync (internal) |

---

## 🔧 Prerequisites

Ensure you have:
- Node.js installed
- All dependencies installed (`npm install` in both root and `dashboard/`)
- VS Code (optional, for tasks)

---

## 🚀 Complete Launch Sequence

### **Phase 1: Clean Environment**

#### **Step 1: Kill Existing Processes**
```bash
# Check what's running on our ports
lsof -i :3001,6274,8080

# Kill any conflicting processes
lsof -ti:3001,6274,8080 | xargs kill -9 2>/dev/null || true
```

---

### **Phase 2: Launch MCP Server with Dashboard Integration**

#### **Step 2: Start MCP Inspector (Terminal 1)**

**Option A: Using npm script**
```bash
# From project root
npm run inspector
```

**Option B: Using VS Code Tasks**
1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: `Tasks: Run Task`
3. Select: `Launch MCP Inspector`

**✅ Expected Output:**
```
> replatforming-mcp@1.0.0 inspector
> npm run build && PORT=3001 npx @modelcontextprotocol/inspector node build/index.js

Langfuse initialized successfully
Agent tracking WebSocket server started on port 8080
Replatforming MCP Server with Agent Dashboard running on stdio
Dashboard WebSocket server available on ws://localhost:8080
MCP Inspector running at http://localhost:6274
```

**⚠️ Critical:** Wait for `"Agent tracking WebSocket server started on port 8080"` before proceeding.

---

### **Phase 3: Launch Dashboard**

#### **Step 3: Start Dashboard (Terminal 2)**
```bash
# Open new terminal, navigate to dashboard
cd dashboard
npm run dev
```

**✅ Expected Output:**
```
> dashboard@0.1.0 dev
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3001
  - Environments: .env.local

 ✓ Ready in 2.3s
```

**⚠️ Wait for:** "Ready" message before opening browser.

---

### **Phase 4: Verify Connections**

#### **Step 4: Check Dashboard Connection**
1. **Open**: http://localhost:3001
2. **Verify**: 
   - ✅ Green "Connected" status in top-left corner
   - ✅ WebSocket status shows "connected"
   - ✅ "Last update" shows recent timestamp

#### **Step 5: Check MCP Inspector**
1. **Open**: http://localhost:6274
2. **Verify**:
   - ✅ Server status shows "Connected"
   - ✅ Tools section shows available tools:
     - `query_codebase_rag`
     - `query_codebase_graph`
     - `get_agent_dashboard`

---

### **Phase 5: Test Integration**

#### **Step 6: Test Real-time Dashboard Updates**

In **MCP Inspector** (`localhost:6274`), test a tool call:

**Tool:** `query_codebase_rag`
**Parameters:**
```json
{
  "query": "How to migrate Express middleware to Fastify plugins?",
  "agentId": "test-user-001"
}
```

**✅ Expected Dashboard Results:**
- **Active Agents**: Increments to 1
- **Total Requests**: Increments as tools are called
- **Agent Timeline**: Shows new agent session with real-time events:
  - 🔵 Thinking: "Analyzing query..."
  - 🟡 Tool Call: "Calling query_codebase_rag..."
  - 🟢 Response: "Tool completed (X.Xs)"
- **Tool Usage**: RAG Queries counter increments

---

## ⚡ Quick Launch Methods

### **Method 1: VS Code Tasks (Recommended)**

1. **Start MCP Inspector:**
   - `Cmd+Shift+P` → `Tasks: Run Task` → `Launch MCP Inspector`
   - Wait for WebSocket server message

2. **Start Dashboard:**
   - New terminal: `cd dashboard && npm run dev`

3. **Open Browsers:**
   - `Cmd+Shift+P` → `Tasks: Run Task` → `Open MCP Inspector Browser`
   - Manually open: http://localhost:3001

### **Method 2: Automated Launch Script**

Create and run the launch script:

```bash
#!/bin/bash
# launch.sh

echo "🚀 Starting Replatforming MCP Dashboard..."

# Clean up existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001,6274,8080 | xargs kill -9 2>/dev/null || true

# Start MCP Inspector in background
echo "🔧 Starting MCP Inspector..."
npm run inspector &
MCP_PID=$!

# Wait for WebSocket server
echo "⏳ Waiting for WebSocket server..."
sleep 5

# Start Dashboard
echo "📊 Starting Dashboard..."
cd dashboard
npm run dev &
DASHBOARD_PID=$!

# Open browsers
sleep 3
if command -v open &> /dev/null; then
    open http://localhost:3001
    open http://localhost:6274
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
    xdg-open http://localhost:6274
fi

echo "✅ All services running:"
echo "   📊 Dashboard: http://localhost:3001"
echo "   🔧 MCP Inspector: http://localhost:6274"
echo "   🔌 WebSocket: ws://localhost:8080"

# Wait for user input to stop
read -p "Press Enter to stop all services..."

# Cleanup
kill $MCP_PID $DASHBOARD_PID 2>/dev/null || true
echo "🛑 All services stopped"
```

**Usage:**
```bash
chmod +x launch.sh
./launch.sh
```

---

## 🚨 Troubleshooting

### **Port Conflicts**

#### **Port 3001 (Dashboard) Busy:**
```bash
# Check what's using it
lsof -i :3001

# Option 1: Kill the process
lsof -ti:3001 | xargs kill -9

# Option 2: Use different port
cd dashboard && npm run dev -- -p 3002
```

#### **Port 8080 (WebSocket) Busy:**
```bash
# Kill WebSocket conflicts
lsof -ti:8080 | xargs kill -9

# Restart MCP Inspector
npm run inspector
```

#### **Port 6274 (MCP Inspector) Busy:**
The MCP Inspector will automatically find the next available port. Check the terminal output for the actual URL.

### **Connection Issues**

#### **Dashboard Shows "Disconnected":**
1. Ensure MCP Inspector started first and shows WebSocket server message
2. Check browser console for WebSocket errors
3. Restart in correct order: MCP Inspector → Dashboard

#### **No Agent Activity in Dashboard:**
1. Verify you're calling tools with an `agentId` parameter
2. Check MCP Inspector terminal for "Created agent session" messages
3. Ensure WebSocket server is running on port 8080

#### **Tools Not Visible in MCP Inspector:**
1. Check build completed successfully: `npm run build`
2. Verify server is connected (green status)
3. Check terminal for any error messages

---

## 📋 Startup Checklist

### **Pre-Launch:**
- [ ] No processes on ports 3001, 6274, 8080
- [ ] Dependencies installed (`npm install` in root and `dashboard/`)
- [ ] Project built (`npm run build`)

### **Launch Sequence:**
- [ ] Start MCP Inspector (Terminal 1)
- [ ] Wait for "WebSocket server started" message
- [ ] Start Dashboard (Terminal 2)
- [ ] Wait for "Ready" message
- [ ] Open browsers and verify connections

### **Post-Launch Verification:**
- [ ] Dashboard shows "Connected" status
- [ ] MCP Inspector shows available tools
- [ ] Test tool call updates dashboard in real-time
- [ ] Agent timeline shows progressive events
- [ ] Metrics update correctly

---

## 🎯 Success Indicators

When everything is working correctly, you should see:

### **Dashboard (localhost:3001):**
- ✅ Green "Connected" status
- ✅ Real-time WebSocket updates
- ✅ Agent timelines with progressive events
- ✅ Metrics updating with tool usage

### **MCP Inspector (localhost:6274):**
- ✅ Server status: Connected
- ✅ Available tools listed
- ✅ Tool calls return successful responses
- ✅ Terminal shows agent session creation

### **Terminal Logs:**
- ✅ "Agent tracking WebSocket server started on port 8080"
- ✅ "Dashboard client connected. Total clients: X"
- ✅ "Created agent session: [agent-id]"
- ✅ "Tracked event for agent [agent-id]: [event-type]"

---

## 🔗 Quick Links

- **Dashboard**: http://localhost:3001
- **MCP Inspector**: http://localhost:6274
- **Project Docs**: [README.md](./README.md)
- **Langfuse Setup**: [docs/LANGFUSE_SETUP.md](./docs/LANGFUSE_SETUP.md)
- **MCP Inspector Docs**: [docs/MCP_INSPECTOR.md](./docs/MCP_INSPECTOR.md)

---

**🎉 You're all set!** Your replatforming MCP server with real-time dashboard monitoring is now running perfectly.
