'use client';

import { getWebSocketUrl } from '@/lib/api/mobile-config';

export interface AnalyticsEvent {
  type: 'metric_update' | 'chart_data' | 'alert' | 'user_activity' | 'campaign_status';
  timestamp: string;
  organizationId: string;
  userId?: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface WebSocketConnectionState {
  isConnected: boolean;
  connectionId: string | null;
  lastHeartbeat: Date | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
}

export type AnalyticsEventHandler = (event: AnalyticsEvent) => void;

export class RealtimeAnalyticsService {
  private static instance: RealtimeAnalyticsService;
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, AnalyticsEventHandler[]> = new Map();
  private connectionState: WebSocketConnectionState = {
    isConnected: false,
    connectionId: null,
    lastHeartbeat: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private subscribedChannels: Set<string> = new Set();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): RealtimeAnalyticsService {
    if (!RealtimeAnalyticsService.instance) {
      RealtimeAnalyticsService.instance = new RealtimeAnalyticsService();
    }
    return RealtimeAnalyticsService.instance;
  }

  /**
   * Initialize WebSocket connection
   */
  public async connect(organizationId: string, userId?: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      const connectionUrl = `${wsUrl}?organizationId=${organizationId}${userId ? `&userId=${userId}` : ''}`;
      
      console.log('🔌 Connecting to WebSocket:', connectionUrl);
      
      this.ws = new WebSocket(connectionUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('❌ Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connectionState.isConnected = false;
    this.connectionState.connectionId = null;
    this.subscribedChannels.clear();
    
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Subscribe to specific analytics channels
   */
  public subscribe(channel: string): void {
    if (this.subscribedChannels.has(channel)) {
      return;
    }

    this.subscribedChannels.add(channel);
    
    if (this.connectionState.isConnected) {
      this.sendMessage({
        type: 'subscribe',
        channel,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Unsubscribe from analytics channels
   */
  public unsubscribe(channel: string): void {
    this.subscribedChannels.delete(channel);
    
    if (this.connectionState.isConnected) {
      this.sendMessage({
        type: 'unsubscribe',
        channel,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Add event handler for specific event types
   */
  public on(eventType: string, handler: AnalyticsEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove event handler
   */
  public off(eventType: string, handler: AnalyticsEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): WebSocketConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Send analytics event to server
   */
  public sendAnalyticsEvent(event: Partial<AnalyticsEvent>): void {
    this.sendMessage({
      type: 'analytics_event',
      ...event,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Request real-time metrics update
   */
  public requestMetricsUpdate(metrics: string[]): void {
    this.sendMessage({
      type: 'request_metrics',
      metrics,
      timestamp: new Date().toISOString()
    });
  }

  // Private methods

  private handleOpen(): void {
    console.log('✅ WebSocket connected');
    this.connectionState.isConnected = true;
    this.connectionState.reconnectAttempts = 0;
    this.connectionState.reconnectDelay = 1000;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Re-subscribe to channels
    this.subscribedChannels.forEach(channel => {
      this.sendMessage({
        type: 'subscribe',
        channel,
        timestamp: new Date().toISOString()
      });
    });

    // Notify handlers
    this.emit('connection', { connected: true });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      switch (data.type) {
        case 'connection_ack':
          this.connectionState.connectionId = data.connectionId;
          console.log('🔗 Connection acknowledged:', data.connectionId);
          break;
          
        case 'heartbeat':
          this.connectionState.lastHeartbeat = new Date();
          break;
          
        case 'analytics_event':
          this.emit(data.eventType || 'analytics_event', data);
          break;
          
        case 'metric_update':
          this.emit('metric_update', data);
          break;
          
        case 'chart_data':
          this.emit('chart_data', data);
          break;
          
        case 'alert':
          this.emit('alert', data);
          break;
          
        case 'error':
          console.error('WebSocket server error:', data.message);
          this.emit('error', data);
          break;
          
        default:
          console.log('📨 Received unknown message type:', data.type);
          this.emit('message', data);
      }
      
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('🔌 WebSocket connection closed:', event.code, event.reason);
    this.connectionState.isConnected = false;
    this.connectionState.connectionId = null;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Notify handlers
    this.emit('connection', { connected: false, code: event.code, reason: event.reason });
    
    // Schedule reconnect if not a manual close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('❌ WebSocket error:', error);
    this.emit('error', { error, timestamp: new Date().toISOString() });
  }

  private sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }

  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connectionState.isConnected) {
        this.sendMessage({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // 30 seconds
  }

  private scheduleReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.connectionState.maxReconnectAttempts) {
      console.error('🚫 Max reconnection attempts reached');
      this.emit('connection_failed', { 
        attempts: this.connectionState.reconnectAttempts 
      });
      return;
    }

    this.connectionState.reconnectAttempts++;
    const delay = this.connectionState.reconnectDelay * Math.pow(2, this.connectionState.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling reconnection attempt ${this.connectionState.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.connectionState.connectionId || 'default');
    }, delay);
  }
}

// Export singleton instance
export const realtimeAnalytics = RealtimeAnalyticsService.getInstance();

// React hook for easier integration
import { useState, useEffect, useRef } from 'react';

export function useRealtimeAnalytics(organizationId: string, userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasRecentUpdates, setHasRecentUpdates] = useState(false);
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState | null>(null);
  const service = useRef(realtimeAnalytics);

  useEffect(() => {
    const handleConnection = (data: any) => {
      setIsConnected(data.connected);
      setConnectionState(service.current.getConnectionState());
    };

    const handleMetricUpdate = (data: any) => {
      setLastUpdate(new Date());
      setHasRecentUpdates(true);
      
      // Clear recent updates flag after 5 seconds
      setTimeout(() => setHasRecentUpdates(false), 5000);
    };

    // Add event listeners
    service.current.on('connection', handleConnection);
    service.current.on('metric_update', handleMetricUpdate);
    service.current.on('chart_data', handleMetricUpdate);

    // Connect
    service.current.connect(organizationId, userId);

    // Cleanup on unmount
    return () => {
      service.current.off('connection', handleConnection);
      service.current.off('metric_update', handleMetricUpdate);
      service.current.off('chart_data', handleMetricUpdate);
    };
  }, [organizationId, userId]);

  const subscribe = (channel: string) => service.current.subscribe(channel);
  const unsubscribe = (channel: string) => service.current.unsubscribe(channel);
  const sendEvent = (event: Partial<AnalyticsEvent>) => service.current.sendAnalyticsEvent(event);
  const requestMetrics = (metrics: string[]) => service.current.requestMetricsUpdate(metrics);

  return {
    isConnected,
    lastUpdate,
    hasRecentUpdates,
    connectionState,
    subscribe,
    unsubscribe,
    sendEvent,
    requestMetrics,
    disconnect: () => service.current.disconnect()
  };
}