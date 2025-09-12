import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import { ContentAnalytics } from '@/lib/api/content-analytics-service';

interface AnalyticsSubscription {
  contentIds: string[];
  organizationId?: string;
  clientId?: string;
}

interface WebSocketClient extends WebSocket {
  id: string;
  subscription?: AnalyticsSubscription;
  lastPing?: number;
}

interface RealTimeUpdate {
  contentId: string;
  field: keyof ContentAnalytics;
  value: number;
  timestamp: number;
  organizationId?: string;
  clientId?: string;
}

export class AnalyticsWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ 
      port,
      path: '/analytics',
      verifyClient: this.verifyClient.bind(this)
    });

    this.setupEventHandlers();
    this.startHeartbeat();

    console.log(`Analytics WebSocket server running on port ${port}`);
  }

  private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
    // In production, implement proper authentication verification
    // For now, allow all connections from localhost
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // Add JWT token verification here for production
    const url = new URL(info.req.url || '', `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');
    
    // Verify JWT token (implement your auth logic here)
    return !!token;
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const clientId = this.generateClientId();
      const client = ws as WebSocketClient;
      client.id = clientId;
      client.lastPing = Date.now();

      this.clients.set(clientId, client);

      console.log(`Analytics client connected: ${clientId}`);

      client.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(client, message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          this.sendError(client, 'Invalid message format');
        }
      });

      client.on('close', () => {
        console.log(`Analytics client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      client.on('error', (error) => {
        console.error("Analytics WebSocket client error:", error);
        this.clients.delete(clientId);
      });

      client.on('pong', () => {
        client.lastPing = Date.now();
      });

      // Send connection acknowledgment
      this.sendMessage(client, {
        type: 'connected',
        clientId,
        timestamp: Date.now()
      });
    });

    this.wss.on('error', (error) => {
      console.error("Analytics WebSocket server error:", error);
    });
  }

  private handleClientMessage(client: WebSocketClient, message: any): void {
    switch (message.type) {
      case 'subscribe':
        this.handleSubscription(client, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(client);
        break;
      case 'ping':
        this.sendMessage(client, { type: 'pong', timestamp: Date.now() });
        break;
      default:
        this.sendError(client, `Unknown message type: ${message.type}`);
    }
  }

  private handleSubscription(client: WebSocketClient, message: any): void {
    const { contentIds, organizationId, clientId } = message;

    if (!Array.isArray(contentIds)) {
      this.sendError(client, 'contentIds must be an array');
      return;
    }

    client.subscription = {
      contentIds,
      organizationId,
      clientId
    };

    this.sendMessage(client, {
      type: 'subscribed',
      contentIds,
      organizationId,
      clientId,
      timestamp: Date.now()
    });

    console.log(`Client ${client.id} subscribed to analytics for ${contentIds.length} content items`);
  }

  private handleUnsubscription(client: WebSocketClient): void {
    client.subscription = undefined;
    this.sendMessage(client, {
      type: 'unsubscribed',
      timestamp: Date.now()
    });

    console.log(`Client ${client.id} unsubscribed from analytics`);
  }

  private sendMessage(client: WebSocketClient, message: any): void {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
      }
    }
  }

  private sendError(client: WebSocketClient, error: string): void {
    this.sendMessage(client, {
      type: 'error',
      error,
      timestamp: Date.now()
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      
      this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          // Check if client responded to last ping within 30 seconds
          if (client.lastPing && (now - client.lastPing) > 30000) {
            console.log(`Client ${client.id} timed out, closing connection`);
            client.terminate();
            this.clients.delete(client.id);
            return;
          }

          // Send ping
          client.ping();
        } else {
          // Clean up dead connections
          this.clients.delete(client.id);
        }
      });
    }, 15000); // Check every 15 seconds
  }

  // Public method to broadcast analytics updates
  public broadcastAnalyticsUpdate(update: RealTimeUpdate): void {
    const message = {
      type: 'analytics_update',
      ...update
    };

    this.clients.forEach((client) => {
      if (!client.subscription) return;

      // Check if client is subscribed to this content
      const isSubscribed = client.subscription.contentIds.includes(update.contentId);
      
      // Check organization/client filtering
      const organizationMatch = !client.subscription.organizationId || 
                               client.subscription.organizationId === update.organizationId;
      const clientMatch = !client.subscription.clientId || 
                         client.subscription.clientId === update.clientId;

      if (isSubscribed && organizationMatch && clientMatch) {
        this.sendMessage(client, message);
      }
    });
  }

  // Public method to broadcast bulk updates
  public broadcastBulkUpdates(updates: RealTimeUpdate[]): void {
    updates.forEach(update => this.broadcastAnalyticsUpdate(update));
  }

  // Method to get connected clients count
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  // Method to get clients by organization
  public getClientsByOrganization(organizationId: string): WebSocketClient[] {
    return Array.from(this.clients.values()).filter(
      client => client.subscription?.organizationId === organizationId
    );
  }

  // Graceful shutdown
  public close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      // Close all client connections
      this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.close(1000, 'Server shutting down');
        }
      });

      this.wss.close(() => {
        console.log('Analytics WebSocket server closed');
        resolve();
      });
    });
  }
}

// Singleton instance
let analyticsWsServer: AnalyticsWebSocketServer | null = null;

export function getAnalyticsWebSocketServer(): AnalyticsWebSocketServer {
  if (!analyticsWsServer) {
    const port = parseInt(process.env.ANALYTICS_WS_PORT || '3001');
    analyticsWsServer = new AnalyticsWebSocketServer(port);
  }
  return analyticsWsServer;
}

export function closeAnalyticsWebSocketServer(): Promise<void> {
  if (analyticsWsServer) {
    const server = analyticsWsServer;
    analyticsWsServer = null;
    return server.close();
  }
  return Promise.resolve();
}