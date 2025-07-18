'use client'

import { useState, useEffect } from 'react'
import { AgentTimeline } from '@/components/AgentTimeline'
import { MetricsCard } from '@/components/MetricsCard'
import { useWebSocket } from '@/hooks/useWebSocket'
import { AgentSession, AgentMetrics } from '@/types/agent'

export default function Dashboard() {
  const [sessions, setSessions] = useState<AgentSession[]>([])
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    toolUsage: { rag: 0, graph: 0 },
    activeAgents: 0
  })

  const { connectionStatus, lastMessage } = useWebSocket('ws://localhost:8080', {
    onMessage: (data) => {
      switch (data.type) {
        case 'initial_state':
          setSessions(data.data.sessions)
          setMetrics(data.data.metrics)
          break
        case 'session_created':
          setSessions(prev => [...prev, data.data])
          break
        case 'event_added':
          setSessions(prev => prev.map(session => 
            session.agentId === data.data.agentId 
              ? { ...session, events: [...session.events, data.data.event] }
              : session
          ))
          break
        case 'event_updated':
          setSessions(prev => prev.map(session => 
            session.agentId === data.data.agentId 
              ? { 
                  ...session, 
                  events: session.events.map((event, index) => 
                    index === data.data.eventIndex ? data.data.event : event
                  )
                }
              : session
          ))
          break
        case 'metrics_updated':
          setMetrics(data.data)
          break
        case 'session_removed':
          setSessions(prev => prev.filter(session => session.agentId !== data.data.agentId))
          break
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Agent Status Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600 capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricsCard
          title="Active Agents"
          value={metrics.activeAgents}
          icon="👤"
          color="blue"
        />
        <MetricsCard
          title="Total Requests"
          value={metrics.totalRequests}
          icon="📊"
          color="green"
        />
        <MetricsCard
          title="Success Rate"
          value={`${((metrics.successfulRequests / Math.max(metrics.totalRequests, 1)) * 100).toFixed(1)}%`}
          icon="✅"
          color="emerald"
        />
        <MetricsCard
          title="Avg Response Time"
          value={`${metrics.averageResponseTime.toFixed(2)}s`}
          icon="⏱️"
          color="purple"
        />
      </div>

      {/* Tool Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tool Usage</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">RAG Queries</span>
              <span className="text-lg font-bold text-blue-600">{metrics.toolUsage.rag}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(metrics.toolUsage.rag / Math.max(metrics.totalRequests, 1)) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Graph Queries</span>
              <span className="text-lg font-bold text-green-600">{metrics.toolUsage.graph}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(metrics.toolUsage.graph / Math.max(metrics.totalRequests, 1)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              WebSocket: <span className="font-medium">{connectionStatus}</span>
            </div>
            {lastMessage && (
              <div className="text-xs text-gray-500">
                Last update: {lastMessage.timestamp 
                  ? new Date(lastMessage.timestamp).toLocaleTimeString() 
                  : 'No timestamp available'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Timelines */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Agent Activity</h2>
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-lg">No active agents</div>
            <div className="text-gray-500 text-sm mt-2">
              Agents will appear here when they start making tool calls
            </div>
          </div>
        ) : (
          sessions
            .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
            .map((session) => (
              <AgentTimeline key={session.agentId} session={session} />
            ))
        )}
      </div>
    </div>
  )
}
