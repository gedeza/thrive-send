import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

// WebSocket server instance
let wss: WebSocketServer | null = null;
const clients = new Map<string, any>();

// Analytics data simulation
const generateMockAnalyticsData = () => {
  return {
    totalViews: Math.floor(Math.random() * 10000) + 1000,
    engagementRate: (Math.random() * 10 + 5).toFixed(1) + '%',
    totalReach: Math.floor(Math.random() * 50000) + 5000,
    conversions: Math.floor(Math.random() * 500) + 50,
    timestamp: new Date().toISOString()
  };
};

// Initialize WebSocket server if not already running
function initializeWebSocketServer() {
  if (wss) return wss;

  const server = createServer();
  wss = new WebSocketServer({ 
    server,
    path: '/api/websocket'
  });

  wss.on('connection', (ws, request) => {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const organizationId = url.searchParams.get('organizationId') || 'default';
    const userId = url.searchParams.get('userId');
    const connectionId = `${organizationId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🔌 New WebSocket connection: ${connectionId}`);

    // Store client connection
    clients.set(connectionId, {
      ws,
      organizationId,
      userId,
      connectionId,
      subscribedChannels: new Set<string>(),
      lastHeartbeat: new Date()
    });

    // Send connection acknowledgment
    ws.send(JSON.stringify({
      type: 'connection_ack',
      connectionId,
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(connectionId, message);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: new Date().toISOString()
        }));
      }
    });

    // Handle connection close
    ws.on('close', () => {
      console.log(`🔌 WebSocket connection closed: ${connectionId}`);
      clients.delete(connectionId);
    });

    // Handle connection error
    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for ${connectionId}:`, error);
      clients.delete(connectionId);
    });

    // Start sending periodic updates for this client
    startPeriodicUpdates(connectionId);
  });

  // Start the WebSocket server on port 3001
  server.listen(3001, () => {
    console.log('🚀 WebSocket server running on port 3001');
  });

  return wss;
}

function handleWebSocketMessage(connectionId: string, message: any) {
  const client = clients.get(connectionId);
  if (!client) return;

  switch (message.type) {
    case 'heartbeat':
      client.lastHeartbeat = new Date();
      client.ws.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      }));
      break;

    case 'subscribe':
      client.subscribedChannels.add(message.channel);
      console.log(`📡 Client ${connectionId} subscribed to ${message.channel}`);
      
      // Send immediate update for the subscribed channel
      sendChannelUpdate(connectionId, message.channel);
      break;

    case 'unsubscribe':
      client.subscribedChannels.delete(message.channel);
      console.log(`📡 Client ${connectionId} unsubscribed from ${message.channel}`);
      break;

    case 'request_metrics':
      sendMetricsUpdate(connectionId, message.metrics);
      break;

    case 'analytics_event':
      // Broadcast analytics event to relevant clients
      broadcastToOrganization(client.organizationId, {
        type: 'analytics_event',
        eventType: message.eventType,
        data: message.data,
        timestamp: new Date().toISOString()
      });
      break;

    default:
      console.log(`❓ Unknown message type: ${message.type}`);
  }
}

function sendChannelUpdate(connectionId: string, channel: string) {
  const client = clients.get(connectionId);
  if (!client) return;

  let updateData;
  
  switch (channel) {
    case 'metrics':
      updateData = {
        type: 'metric_update',
        channel,
        data: generateMockAnalyticsData(),
        timestamp: new Date().toISOString()
      };
      break;

    case 'charts':
      updateData = {
        type: 'chart_data',
        channel,
        data: {
          performanceTrend: generateChartData(),
          platformPerformance: generateBarChartData()
        },
        timestamp: new Date().toISOString()
      };
      break;

    case 'alerts':
      updateData = {
        type: 'alert',
        channel,
        data: {
          message: 'Campaign performance has increased by 15%',
          severity: 'info',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };
      break;

    default:
      return;
  }

  client.ws.send(JSON.stringify(updateData));
}

function sendMetricsUpdate(connectionId: string, metrics: string[]) {
  const client = clients.get(connectionId);
  if (!client) return;

  const metricsData = metrics.reduce((acc, metric) => {
    acc[metric] = generateMockAnalyticsData();
    return acc;
  }, {} as any);

  client.ws.send(JSON.stringify({
    type: 'metric_update',
    data: metricsData,
    timestamp: new Date().toISOString()
  }));
}

function broadcastToOrganization(organizationId: string, message: any) {
  clients.forEach((client) => {
    if (client.organizationId === organizationId && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

function startPeriodicUpdates(connectionId: string) {
  const client = clients.get(connectionId);
  if (!client) return;

  // Send updates every 30 seconds for subscribed channels
  const interval = setInterval(() => {
    if (!clients.has(connectionId)) {
      clearInterval(interval);
      return;
    }

    client.subscribedChannels.forEach((channel: string) => {
      sendChannelUpdate(connectionId, channel);
    });
  }, 30000);

  // Send immediate metrics update
  setTimeout(() => {
    if (clients.has(connectionId)) {
      sendChannelUpdate(connectionId, 'metrics');
    }
  }, 1000);
}

// Helper functions for generating mock data
function generateChartData() {
  const data = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 1000) + 500,
      engagement: Math.floor(Math.random() * 200) + 100,
      conversions: Math.floor(Math.random() * 50) + 10
    });
  }
  
  return data;
}

function generateBarChartData() {
  return [
    { platform: 'Facebook', performance: Math.floor(Math.random() * 100) + 50 },
    { platform: 'Instagram', performance: Math.floor(Math.random() * 100) + 50 },
    { platform: 'Twitter', performance: Math.floor(Math.random() * 100) + 50 },
    { platform: 'LinkedIn', performance: Math.floor(Math.random() * 100) + 50 },
    { platform: 'TikTok', performance: Math.floor(Math.random() * 100) + 50 }
  ];
}

// HTTP endpoints for WebSocket management
export async function GET(request: NextRequest) {
  // Initialize WebSocket server if needed
  if (!wss) {
    initializeWebSocketServer();
  }

  return Response.json({
    status: 'WebSocket server running',
    port: 3001,
    activeConnections: clients.size,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, eventType, data } = body;

    if (!organizationId) {
      return Response.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Broadcast event to organization clients
    broadcastToOrganization(organizationId, {
      type: 'analytics_event',
      eventType: eventType || 'custom',
      data,
      timestamp: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      message: 'Event broadcasted',
      clientsNotified: Array.from(clients.values())
        .filter(client => client.organizationId === organizationId).length
    });

  } catch (error) {
    console.error('❌ Error broadcasting event:', error);
    return Response.json({ error: 'Failed to broadcast event' }, { status: 500 });
  }
}

// Initialize WebSocket server on module load
if (typeof window === 'undefined') {
  // Only run on server side
  setTimeout(() => {
    initializeWebSocketServer();
  }, 1000);
}