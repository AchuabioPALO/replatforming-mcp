import { useState } from 'react';
import { AgentSession, AgentEvent } from '@/types/agent';

interface AgentTimelineProps {
  session: AgentSession;
}

function getEventIcon(event: AgentEvent): string {
  switch (event.type) {
    case 'thinking': return '🔵';
    case 'tool_call': return '🟡';
    case 'response': return '🟢';
    case 'error': return '🔴';
    default: return '⚪';
  }
}

function getStatusColor(status: AgentSession['status']): string {
  switch (status) {
    case 'active': return 'text-green-600';
    case 'idle': return 'text-blue-600';
    case 'error': return 'text-red-600';
    case 'completed': return 'text-gray-600';
    default: return 'text-gray-600';
  }
}

function formatDuration(event: AgentEvent): string {
  if (event.duration) {
    return `(${event.duration.toFixed(2)}s)`;
  }
  return '';
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-32 bg-gray-200 rounded-full h-2 ml-4">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function EventNode({ event, isLast }: { event: AgentEvent; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = event.metadata?.query || event.metadata?.response || event.metadata?.errorDetails;

  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className="text-lg">{getEventIcon(event)}</div>
        {!isLast && <div className="w-0.5 bg-gray-200 h-6 mt-1" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
          <span className="font-medium">{event.message}</span>
          {event.duration && (
            <span className="text-sm text-gray-500">{formatDuration(event)}</span>
          )}
          {event.progress !== undefined && event.progress < 100 && (
            <ProgressBar progress={event.progress} />
          )}
          {hasDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 ml-2"
            >
              {isExpanded ? '▼' : '▶'} Details
            </button>
          )}
        </div>
        
        {isExpanded && hasDetails && (
          <div className="mt-2 p-3 bg-gray-50 rounded border text-sm">
            {event.metadata?.query && (
              <div className="mb-2">
                <strong>Query:</strong>
                <div className="text-gray-700 mt-1">{event.metadata.query}</div>
              </div>
            )}
            {event.metadata?.response && (
              <div className="mb-2">
                <strong>Response:</strong>
                <div className="text-gray-700 mt-1 max-h-32 overflow-y-auto">
                  {event.metadata.response.substring(0, 200)}
                  {event.metadata.response.length > 200 && '...'}
                </div>
              </div>
            )}
            {event.metadata?.errorDetails && (
              <div>
                <strong>Error:</strong>
                <div className="text-red-700 mt-1">{event.metadata.errorDetails}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function AgentTimeline({ session }: AgentTimelineProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              🤖 Agent-{session.agentId.substring(0, 8)}
            </h3>
            <span className={`text-sm font-medium ${getStatusColor(session.status)}`}>
              [{session.status.toUpperCase()}]
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Started: {new Date(session.startTime).toLocaleTimeString()}
            </span>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isCollapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          {session.events.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No events yet
            </div>
          ) : (
            <div className="space-y-0">
              {session.events.map((event, index) => (
                <EventNode
                  key={`${new Date(event.timestamp).toISOString()}-${index}`}
                  event={event}
                  isLast={index === session.events.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
