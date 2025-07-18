#!/bin/bash

# Port Cleanup Script - Kills processes on MCP ports

echo "🧹 Cleaning up MCP server ports..."

# Ports used by the MCP system
PORTS=(8080 6274 3001)

# Also check for dynamic MCP Inspector ports (6270-6280 range)
DYNAMIC_PORTS=$(lsof -ti :6270,:6271,:6272,:6273,:6275,:6276,:6277,:6278,:6279,:6280 2>/dev/null)

if [ ! -z "$DYNAMIC_PORTS" ]; then
    echo "Found processes on dynamic MCP Inspector ports..."
    echo "$DYNAMIC_PORTS" | xargs kill -9 2>/dev/null
    echo "  Killed dynamic port processes"
fi

for port in "${PORTS[@]}"; do
    echo "Checking port $port..."
    
    # Find and kill processes on this port
    pids=$(lsof -ti :$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo "  Killing processes on port $port: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 1
    else
        echo "  Port $port is free"
    fi
done

echo "✅ Port cleanup completed!"
echo ""
echo "Ports status:"
lsof -i :8080 -i :6274 -i :3001 2>/dev/null || echo "All ports are now free!"
