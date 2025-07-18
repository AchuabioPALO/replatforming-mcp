import { Langfuse } from "langfuse";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { AgentEvent, AgentSession, AgentMetrics } from "../types/agent-events.js";

export class AgentTracker {
  private langfuse: Langfuse | null = null;
  private sessions: Map<string, AgentSession> = new Map();
  private wsServer: WebSocketServer | null = null;
  private connectedClients: Set<WebSocket> = new Set();
  private metrics: AgentMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    toolUsage: { rag: 0, graph: 0 },
    activeAgents: 0
  };

  constructor() {
    // Initialize Langfuse only if credentials are available
    const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
    const secretKey = process.env.LANGFUSE_SECRET_KEY;
    
    if (publicKey && secretKey) {
      try {
        this.langfuse = new Langfuse({
          publicKey,
          secretKey,
          baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com"
        });
        console.error('Langfuse initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Langfuse:', error);
        this.langfuse = null;
      }
    } else {
      console.error('Langfuse credentials not found. Agent tracking will work without Langfuse persistence.');
    }
  }

  /**
   * Initialize WebSocket server for real-time updates
   */
  initializeWebSocket(port: number = 8080) {
    // Don't initialize if already running
    if (this.wsServer) {
      console.error(`WebSocket server already running on port ${port}`);
      return;
    }

    try {
      this.wsServer = new WebSocketServer({ port });
      
      this.wsServer.on('connection', (ws: WebSocket) => {
        console.error(`Dashboard client connected. Total clients: ${this.connectedClients.size + 1}`);
        this.connectedClients.add(ws);
        
        // Send current state to new client
        this.sendToClient(ws, {
          type: 'initial_state',
          data: {
            sessions: Array.from(this.sessions.values()),
            metrics: this.metrics
          }
        });

        ws.on('close', () => {
          this.connectedClients.delete(ws);
          console.error(`Dashboard client disconnected. Total clients: ${this.connectedClients.size}`);
        });

        ws.on('error', (error: Error) => {
          console.error('WebSocket client error:', error);
          this.connectedClients.delete(ws);
        });
      });

      this.wsServer.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use. Dashboard WebSocket server will not be available.`);
          console.error(`Try: lsof -ti:${port} | xargs kill -9`);
          this.wsServer = null;
        } else {
          console.error('WebSocket server error:', error);
        }
      });

      console.error(`Agent tracking WebSocket server started on port ${port}`);
      
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
      this.wsServer = null;
    }
  }

  /**
   * Create a new agent session
   */
  createSession(agentId?: string): string {
    const sessionId = agentId || uuidv4();
    const session: AgentSession = {
      agentId: sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      events: [],
      status: "active"
    };

    this.sessions.set(sessionId, session);
    this.updateMetrics();
    this.broadcastUpdate('session_created', session);
    
    console.error(`Created agent session: ${sessionId}`);
    return sessionId;
  }

  /**
   * Track an agent event
   */
  trackEvent(agentId: string, event: Omit<AgentEvent, 'agentId' | 'timestamp'>): void {
    const session = this.sessions.get(agentId);
    if (!session) {
      console.error(`Session not found for agent: ${agentId}`);
      return;
    }

    const fullEvent: AgentEvent = {
      agentId,
      timestamp: new Date(),
      ...event
    };

    session.events.push(fullEvent);
    session.lastActivity = new Date();
    
    // Update session status based on event type
    if (event.type === 'error') {
      session.status = 'error';
    } else if (event.type === 'response' && !event.progress) {
      session.status = 'idle';
    } else if (event.type === 'tool_call') {
      session.status = 'active';
    }

    // Track in Langfuse
    this.trackInLangfuse(agentId, fullEvent);
    
    // Update metrics
    this.updateMetrics();
    
    // Broadcast to connected clients
    this.broadcastUpdate('event_added', { agentId, event: fullEvent });
    
    console.error(`Tracked event for agent ${agentId}: ${event.type} - ${event.message}`);
  }

  /**
   * Track tool call start
   */
  startToolCall(agentId: string, toolName: "query_codebase_rag" | "query_codebase_graph", query: string): string {
    const traceId = uuidv4();
    
    this.trackEvent(agentId, {
      type: 'tool_call',
      toolName,
      message: `Calling ${toolName}...`,
      progress: 0,
      metadata: { query, traceId }
    });

    return traceId;
  }

  /**
   * Update tool call progress
   */
  updateToolProgress(agentId: string, traceId: string, progress: number, message?: string): void {
    const session = this.sessions.get(agentId);
    if (!session) return;

    // Find the latest tool call event with this traceId (search from end)
    let eventIndex = -1;
    for (let i = session.events.length - 1; i >= 0; i--) {
      const event = session.events[i];
      if (event.metadata?.traceId === traceId && event.type === 'tool_call') {
        eventIndex = i;
        break;
      }
    }

    if (eventIndex >= 0) {
      session.events[eventIndex].progress = progress;
      if (message) {
        session.events[eventIndex].message = message;
      }
      
      this.broadcastUpdate('event_updated', { 
        agentId, 
        eventIndex, 
        event: session.events[eventIndex] 
      });
    }
  }

  /**
   * Complete tool call
   */
  completeToolCall(agentId: string, traceId: string, response: string, duration: number, success: boolean = true): void {
    this.trackEvent(agentId, {
      type: success ? 'response' : 'error',
      message: success ? `Tool completed (${duration.toFixed(2)}s)` : 'Tool failed',
      duration,
      metadata: { response, traceId }
    });

    // Update metrics
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    // Update and broadcast all metrics
    this.updateMetrics();
  }

  /**
   * Track in Langfuse for persistence
   */
  private trackInLangfuse(agentId: string, event: AgentEvent): void {
    if (!this.langfuse) {
      return; // Skip if Langfuse is not initialized
    }
    
    try {
      const trace = this.langfuse.trace({
        id: event.metadata?.traceId || uuidv4(),
        name: `agent_${agentId}_${event.type}`,
        userId: agentId,
        sessionId: agentId,
        input: event.metadata?.query,
        output: event.metadata?.response,
        metadata: {
          type: event.type,
          toolName: event.toolName,
          message: event.message,
          duration: event.duration,
          progress: event.progress
        }
      });

      if (event.type === 'tool_call' && event.toolName) {
        trace.span({
          name: event.toolName,
          input: event.metadata?.query,
          output: event.metadata?.response,
          startTime: event.timestamp,
          endTime: event.duration ? new Date(event.timestamp.getTime() + event.duration * 1000) : undefined
        });
      }

    } catch (error) {
      console.error('Failed to track in Langfuse:', error);
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.activeAgents = Array.from(this.sessions.values()).filter(s => s.status === 'active').length;
    this.metrics.totalRequests = Array.from(this.sessions.values()).reduce((sum, s) => 
      sum + s.events.filter(e => e.type === 'tool_call').length, 0
    );

    // Calculate average response time
    const completedCalls = Array.from(this.sessions.values()).flatMap(s => 
      s.events.filter(e => e.type === 'response' && e.duration)
    );
    
    if (completedCalls.length > 0) {
      this.metrics.averageResponseTime = completedCalls.reduce((sum, e) => sum + (e.duration || 0), 0) / completedCalls.length;
    }

    // Update tool usage
    this.metrics.toolUsage.rag = Array.from(this.sessions.values()).reduce((sum, s) => 
      sum + s.events.filter(e => e.toolName === 'query_codebase_rag').length, 0
    );
    this.metrics.toolUsage.graph = Array.from(this.sessions.values()).reduce((sum, s) => 
      sum + s.events.filter(e => e.toolName === 'query_codebase_graph').length, 0
    );

    // Broadcast updated metrics to all clients
    this.broadcastUpdate('metrics_updated', this.metrics);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      // Always include timestamp for consistency with broadcastUpdate
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(messageWithTimestamp));
    }
  }

  /**
   * Broadcast update to all connected clients
   */
  private broadcastUpdate(type: string, data: any): void {
    const message = JSON.stringify({ 
      type, 
      data, 
      timestamp: new Date().toISOString() // Convert to ISO string explicitly
    });
    
    this.connectedClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      } else {
        this.connectedClients.delete(ws);
      }
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): AgentMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get all sessions
   */
  getSessions(): AgentSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Cleanup old sessions (older than 1 hour)
   */
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneHourAgo && session.status !== 'active') {
        this.sessions.delete(sessionId);
        this.broadcastUpdate('session_removed', { agentId: sessionId });
      }
    }
  }

  /**
   * Shutdown gracefully
   */
  shutdown(): void {
    if (this.wsServer) {
      this.wsServer.close();
    }
    if (this.langfuse) {
      this.langfuse.shutdownAsync();
    }
  }
}
