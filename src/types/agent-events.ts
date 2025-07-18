/**
 * Agent Event Types for Dashboard Monitoring
 */

export interface AgentEvent {
  agentId: string;
  timestamp: Date;
  type: "thinking" | "tool_call" | "response" | "error";
  toolName?: "query_codebase_rag" | "query_codebase_graph";
  message: string;
  duration?: number;
  progress?: number; // 0-100 for in-progress
  metadata?: {
    query?: string;
    response?: string;
    errorDetails?: string;
    traceId?: string;
  };
}

export interface AgentMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  toolUsage: {
    rag: number;
    graph: number;
  };
  activeAgents: number;
}

export interface AgentSession {
  agentId: string;
  startTime: Date;
  lastActivity: Date;
  events: AgentEvent[];
  status: "active" | "idle" | "error" | "completed";
}
