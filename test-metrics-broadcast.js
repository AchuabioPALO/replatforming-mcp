#!/usr/bin/env node

/**
 * Quick test to verify metrics broadcasting works
 */

import { AgentTracker } from './build/services/agent-tracker.js';

const tracker = new AgentTracker();

console.error('🧪 Testing metrics broadcasting...');

try {
  tracker.initializeWebSocket(8080);
  console.error('✅ WebSocket server started');
  
  // Create a test session
  const session = tracker.createSession('test-agent');
  console.error('✅ Test agent session created');
  
  // Simulate a tool call
  const traceId = tracker.startToolCall(session, 'query_codebase_rag', 'Test query');
  console.error('✅ Tool call started');
  
  // Complete the tool call after 2 seconds
  setTimeout(() => {
    tracker.completeToolCall(session, traceId, 'Test response', 1.5, true);
    console.error('✅ Tool call completed');
    console.error('📊 Metrics should have been broadcast to any connected dashboards');
    
    // Show current metrics
    const metrics = tracker.getMetrics();
    console.error('Current metrics:', JSON.stringify(metrics, null, 2));
    
    // Cleanup
    setTimeout(() => {
      tracker.shutdown();
      console.error('✅ Test completed successfully');
      process.exit(0);
    }, 1000);
  }, 2000);
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}

// Cleanup on interrupt
process.on('SIGINT', () => {
  tracker.shutdown();
  process.exit(0);
});
