import { getAnalyticsWebSocketServer } from './analytics-websocket-server';
import { ContentAnalytics } from '@/lib/api/content-analytics-service';
import { db } from '@/lib/db';

interface RealTimeUpdate {
  contentId: string;
  field: keyof ContentAnalytics;
  value: number;
  timestamp: number;
  organizationId?: string;
  clientId?: string;
}

export class AnalyticsBroadcaster {
  private static instance: AnalyticsBroadcaster;
  private simulationInterval?: NodeJS.Timeout;
  private isSimulating = false;

  public static getInstance(): AnalyticsBroadcaster {
    if (!AnalyticsBroadcaster.instance) {
      AnalyticsBroadcaster.instance = new AnalyticsBroadcaster();
    }
    return AnalyticsBroadcaster.instance;
  }

  // Start simulated analytics updates for development
  public startSimulation(intervalMs: number = 10000): void {
    if (this.isSimulating) {
      console.log('Analytics simulation already running');
      return;
    }

    console.log(`Starting analytics simulation with ${intervalMs}ms interval`);
    this.isSimulating = true;

    this.simulationInterval = setInterval(async () => {
      await this.generateSimulatedUpdates();
    }, intervalMs);
  }

  // Stop simulated updates
  public stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
    this.isSimulating = false;
    console.log('Analytics simulation stopped');
  }

  // Generate realistic analytics updates
  private async generateSimulatedUpdates(): Promise<void> {
    try {
      // Get some content IDs from database for realistic simulation
      const recentContent = await db.content.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          organizationId: true,
          clientId: true
        }
      });

      if (recentContent.length === 0) {
        console.log('No content found for analytics simulation');
        return;
      }

      // Generate 1-3 random updates
      const numUpdates = Math.floor(Math.random() * 3) + 1;
      const updates: RealTimeUpdate[] = [];

      for (let i = 0; i < numUpdates; i++) {
        const randomContent = recentContent[Math.floor(Math.random() * recentContent.length)];
        const updateTypes: Array<keyof ContentAnalytics> = ['views', 'likes', 'shares', 'comments'];
        const randomField = updateTypes[Math.floor(Math.random() * updateTypes.length)];

        // Generate realistic increments based on field type
        let increment = 1;
        switch (randomField) {
          case 'views':
            increment = Math.floor(Math.random() * 10) + 1; // 1-10 views
            break;
          case 'likes':
            increment = Math.floor(Math.random() * 5) + 1; // 1-5 likes
            break;
          case 'shares':
            increment = Math.floor(Math.random() * 3) + 1; // 1-3 shares
            break;
          case 'comments':
            increment = Math.floor(Math.random() * 2) + 1; // 1-2 comments
            break;
        }

        // Get current analytics value and add increment
        const currentAnalytics = await this.getCurrentAnalytics(randomContent.id, randomField);
        const newValue = currentAnalytics + increment;

        updates.push({
          contentId: randomContent.id,
          field: randomField,
          value: newValue,
          timestamp: Date.now(),
          organizationId: randomContent.organizationId,
          clientId: randomContent.clientId || undefined
        });

        // Update database with new value (optional - for persistence)
        await this.updateAnalyticsInDatabase(randomContent.id, randomField, newValue);
      }

      // Broadcast updates via WebSocket
      this.broadcastUpdates(updates);

      console.log(`Broadcasted ${updates.length} analytics updates`);
    } catch (_error) {
      console.error("", _error);
    }
  }

  // Get current analytics value from database
  private async getCurrentAnalytics(contentId: string, field: keyof ContentAnalytics): Promise<number> {
    try {
      const analytics = await db.contentAnalytics.findUnique({
        where: { contentId },
        select: { [field]: true }
      });

      return (analytics?.[field] as number) || 0;
    } catch (_error) {
      console.error("", _error);
      return Math.floor(Math.random() * 100); // Fallback to random value
    }
  }

  // Update analytics in database
  private async updateAnalyticsInDatabase(
    contentId: string, 
    field: keyof ContentAnalytics, 
    value: number
  ): Promise<void> {
    try {
      await db.contentAnalytics.upsert({
        where: { contentId },
        update: {
          [field]: value,
          updatedAt: new Date()
        },
        create: {
          contentId,
          [field]: value,
          views: field === 'views' ? value : 0,
          likes: field === 'likes' ? value : 0,
          shares: field === 'shares' ? value : 0,
          comments: field === 'comments' ? value : 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (_error) {
      console.error("", _error);
    }
  }

  // Broadcast updates to WebSocket clients
  public broadcastUpdates(updates: RealTimeUpdate[]): void {
    try {
      const wsServer = getAnalyticsWebSocketServer();
      wsServer.broadcastBulkUpdates(updates);
    } catch (_error) {
      console.error("", _error);
    }
  }

  // Broadcast single update
  public broadcastSingleUpdate(update: RealTimeUpdate): void {
    try {
      const wsServer = getAnalyticsWebSocketServer();
      wsServer.broadcastAnalyticsUpdate(update);
    } catch (_error) {
      console.error("", _error);
    }
  }

  // Manual trigger for real analytics updates (called by API endpoints)
  public async triggerRealUpdate(
    contentId: string,
    field: keyof ContentAnalytics,
    increment: number = 1,
    organizationId?: string,
    clientId?: string
  ): Promise<void> {
    try {
      const currentValue = await this.getCurrentAnalytics(contentId, field);
      const newValue = currentValue + increment;

      // Update database
      await this.updateAnalyticsInDatabase(contentId, field, newValue);

      // Broadcast update
      const update: RealTimeUpdate = {
        contentId,
        field,
        value: newValue,
        timestamp: Date.now(),
        organizationId,
        clientId
      };

      this.broadcastSingleUpdate(update);

      console.log(`Real analytics update: ${field} +${increment} for content ${contentId}`);
    } catch (_error) {
      console.error("", _error);
    }
  }

  // Get simulation status
  public getSimulationStatus(): { isRunning: boolean; connectedClients: number } {
    const wsServer = getAnalyticsWebSocketServer();
    return {
      isRunning: this.isSimulating,
      connectedClients: wsServer.getConnectedClientsCount()
    };
  }

  // Cleanup on shutdown
  public shutdown(): void {
    this.stopSimulation();
    console.log('Analytics broadcaster shut down');
  }
}

// Initialize broadcaster in development
if (process.env.NODE_ENV === 'development') {
  const broadcaster = AnalyticsBroadcaster.getInstance();
  
  // Start simulation with 15-second intervals
  setTimeout(() => {
    broadcaster.startSimulation(15000);
  }, 5000); // Wait 5 seconds after startup

  // Graceful shutdown
  process.on('SIGINT', () => {
    broadcaster.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    broadcaster.shutdown();
    process.exit(0);
  });
}

export const analyticsBroadcaster = AnalyticsBroadcaster.getInstance();