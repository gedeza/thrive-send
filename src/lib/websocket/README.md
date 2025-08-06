# WebSocket Analytics System

## Overview

This directory contains the implementation of a real-time analytics WebSocket system that replaces the previous simulated analytics updates. The system provides live analytics data streaming for content performance metrics.

## Architecture

### Components

1. **Analytics WebSocket Server** (`analytics-websocket-server.ts`)
   - Production-ready WebSocket server
   - Client connection management with heartbeat monitoring  
   - Subscription-based content filtering
   - Organization and client-level access control
   - Graceful shutdown handling

2. **Analytics Broadcaster** (`analytics-broadcaster.ts`)
   - Centralized analytics update distribution
   - Simulation mode for development environments
   - Real analytics update triggers for production
   - Database integration for persistence

3. **Client Hook** (`../hooks/useRealTimeAnalytics.ts`)
   - React hook for WebSocket client connection
   - Automatic reconnection with exponential backoff
   - Fallback to simulation mode if WebSocket fails
   - Integration with React Query for cache invalidation

## Usage

### Starting the WebSocket Server

```bash
# Development mode with hot reloading
pnpm analytics-ws:dev

# Production mode
pnpm analytics-ws:start
```

### Client Connection

```typescript
import { useRealTimeAnalytics } from '@/lib/hooks/useRealTimeAnalytics';

const realtimeAnalytics = useRealTimeAnalytics({
  contentIds: ['content-1', 'content-2'],
  enabled: true,
  interval: 30000, // Fallback polling interval
  simulateUpdates: false // Use real WebSocket connection
});
```

### Triggering Analytics Updates

```typescript
// Via API endpoint
const response = await fetch('/api/analytics/trigger-update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contentId: 'content-123',
    field: 'views',
    increment: 1,
    organizationId: 'org-456',
    clientId: 'client-789'
  })
});

// Programmatically
import { analyticsBroadcaster } from '@/lib/websocket/analytics-broadcaster';

await analyticsBroadcaster.triggerRealUpdate(
  'content-123',
  'likes',
  1,
  'org-456',
  'client-789'
);
```

## Configuration

### Environment Variables

```env
# WebSocket server port (default: 3001)
ANALYTICS_WS_PORT=3001

# Client-side WebSocket URL (default: ws://localhost:3001/analytics)  
NEXT_PUBLIC_WS_URL=ws://localhost:3001/analytics

# Organization and client context (optional)
NEXT_PUBLIC_ORGANIZATION_ID=your-org-id
NEXT_PUBLIC_CLIENT_ID=your-client-id
```

### Performance Thresholds

Performance scoring is now fully configurable via the `performance-thresholds.ts` config file:

```typescript
import { getPerformanceConfig } from '@/lib/config/performance-thresholds';

const config = getPerformanceConfig();
// Customizable thresholds, content type weights, and trending criteria
```

## WebSocket Protocol

### Client → Server Messages

```typescript
// Subscribe to analytics updates
{
  type: 'subscribe',
  contentIds: string[],
  organizationId?: string,
  clientId?: string
}

// Unsubscribe from updates  
{
  type: 'unsubscribe'
}

// Heartbeat ping
{
  type: 'ping'
}
```

### Server → Client Messages

```typescript
// Connection established
{
  type: 'connected',
  clientId: string,
  timestamp: number
}

// Subscription confirmed
{
  type: 'subscribed', 
  contentIds: string[],
  organizationId?: string,
  clientId?: string,
  timestamp: number
}

// Real-time analytics update
{
  type: 'analytics_update',
  contentId: string,
  field: 'views' | 'likes' | 'shares' | 'comments',
  value: number,
  timestamp: number,
  organizationId?: string,
  clientId?: string
}

// Heartbeat response
{
  type: 'pong',
  timestamp: number
}

// Error message
{
  type: 'error',
  error: string,
  timestamp: number
}
```

## Development vs Production

### Development Mode
- Automatic simulation of analytics updates every 15 seconds
- Lower trending thresholds for easier testing
- WebSocket server auto-starts with simulation
- Fallback to polling if WebSocket connection fails

### Production Mode  
- Real analytics updates triggered by user actions
- Higher performance thresholds
- JWT authentication required for WebSocket connections
- Proper error handling and monitoring

## Monitoring

### Health Check Endpoints

```bash
# Check broadcaster status
GET /api/analytics/trigger-update

# Response includes:
{
  "status": {
    "simulationRunning": boolean,
    "connectedClients": number,
    "timestamp": number
  }
}
```

### Console Logging

The system provides detailed console logging for:
- WebSocket connection events
- Analytics updates broadcast
- Client subscription changes  
- Error conditions and recovery

## Security Considerations

1. **Authentication**: Production mode requires JWT token validation
2. **Rate Limiting**: Built-in connection limits and heartbeat monitoring
3. **Data Filtering**: Organization and client-level access control
4. **Input Validation**: All analytics updates are validated before processing

## Testing

### Unit Tests
```bash
pnpm test -- src/lib/websocket/
```

### Integration Tests
```bash
# Test WebSocket connection
node -e "
const ws = new WebSocket('ws://localhost:3001/analytics');
ws.on('open', () => console.log('Connected'));
ws.on('message', (data) => console.log(JSON.parse(data)));
"
```

### Manual Testing
1. Start the analytics WebSocket server
2. Open the analytics page in browser
3. Check browser console for WebSocket connection logs
4. Trigger updates via API endpoint
5. Verify real-time updates appear in the dashboard

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**
   - Check if analytics WebSocket server is running
   - Verify NEXT_PUBLIC_WS_URL environment variable
   - Check browser console for connection errors

2. **No real-time updates**
   - Verify content IDs are correctly subscribed
   - Check analytics broadcaster is running
   - Ensure database has analytics data to update

3. **Performance issues**
   - Monitor connected client count
   - Check heartbeat interval timing
   - Verify database query performance

### Debug Commands

```bash
# Check WebSocket server status
curl http://localhost:3001/health

# View broadcaster status
curl http://localhost:3000/api/analytics/trigger-update

# Test analytics update
curl -X POST http://localhost:3000/api/analytics/trigger-update \
  -H "Content-Type: application/json" \
  -d '{"contentId":"test","field":"views","increment":1}'
```

## Migration Notes

This implementation replaces the previous simulated analytics system:

### Before (Simulated)
```typescript
simulateUpdates: true // Polling-based fake updates
```

### After (Real WebSocket)  
```typescript
simulateUpdates: false // Live WebSocket connection
```

The system maintains backward compatibility with automatic fallback to simulation mode if WebSocket connection fails.