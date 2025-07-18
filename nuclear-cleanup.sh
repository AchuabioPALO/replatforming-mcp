#!/bin/bash

# Aggressive cleanup for stubborn MCP processes

echo "💥 Aggressive MCP cleanup..."

# Kill all node processes that might be MCP related
echo "Killing node processes that contain 'mcp', 'inspector', or 'replatforming'..."
ps aux | grep -E "(mcp|inspector|replatforming)" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null

# Kill processes on a wide range of ports
echo "Cleaning ports 3000-3010, 6270-6280, 8080-8090..."
for port in {3000..3010} {6270..6280} {8080..8090}; do
    lsof -ti :$port 2>/dev/null | xargs kill -9 2>/dev/null
done

# Give it a moment to clean up
sleep 2

echo "✅ Aggressive cleanup completed!"
echo ""
echo "Port status check:"
lsof -i :8080 -i :6274 -i :3001 2>/dev/null || echo "All main ports are now free!"
