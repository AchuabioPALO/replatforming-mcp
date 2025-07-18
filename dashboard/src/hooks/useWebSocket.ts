'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentSession, AgentMetrics, WebSocketMessage } from '@/types/agent';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
}

export function useWebSocket(url: string, options?: UseWebSocketOptions) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const optionsRef = useRef(options);
  
  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      const websocket = new WebSocket(url);
      
      websocket.onopen = () => {
        console.log('Connected to agent tracker WebSocket');
        setConnectionStatus('connected');
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Call the onMessage callback if provided
          if (optionsRef.current?.onMessage) {
            optionsRef.current.onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket connection closed');
        setConnectionStatus('disconnected');
        setWs(null);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionStatus('disconnected');
      setTimeout(connect, 3000);
    }
  }, [url]);

  useEffect(() => {
    connect();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  return { connectionStatus, lastMessage };
}
