/**
 * 📧 Email Delivery Tracking and Analytics System
 * 
 * Comprehensive tracking system for massive scale email delivery operations
 * providing real-time analytics, delivery insights, and performance optimization.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/utils/logger';
import { db } from '@/lib/db/index';
import Redis from 'ioredis';

// Types
export interface DeliveryEvent {
  id: string;
  emailId: string;
  campaignId: string;
  organizationId: string;
  recipientEmail: string;
  eventType: DeliveryEventType;
  timestamp: Date;
  metadata?: Record<string, any>;
  provider?: string;
  messageId?: string;
  bounceType?: string;
  complaintType?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

export enum DeliveryEventType {
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  CLICKED = 'clicked',
  BOUNCED = 'bounced',
  COMPLAINED = 'complained',
  UNSUBSCRIBED = 'unsubscribed',
  DEFERRED = 'deferred',
  BLOCKED = 'blocked',
  REJECTED = 'rejected',
}

export interface DeliveryMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalComplaints: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
}

export interface RealTimeStats {
  lastHour: DeliveryMetrics;
  lastDay: DeliveryMetrics;
  lastWeek: DeliveryMetrics;
  lastMonth: DeliveryMetrics;
}

export interface DeliveryAnalytics {
  organizationId: string;
  campaignId?: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: DeliveryMetrics;
  trends: {
    deliveryTrend: Array<{ timestamp: Date; value: number }>;
    openTrend: Array<{ timestamp: Date; value: number }>;
    clickTrend: Array<{ timestamp: Date; value: number }>;
    bounceTrend: Array<{ timestamp: Date; value: number }>;
  };
  breakdown: {
    byProvider: Record<string, DeliveryMetrics>;
    byHour: Record<string, DeliveryMetrics>;
    byDay: Record<string, DeliveryMetrics>;
    byLocation: Record<string, DeliveryMetrics>;
    byDevice: Record<string, DeliveryMetrics>;
  };
}

export class DeliveryTracker {
  private redis: Redis;
  private metricsCache = new Map<string, any>();

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_TRACKING_DB || '3'),
      keyPrefix: 'delivery:',
      maxRetriesPerRequest: 3,
    });
  }

  /**
   * Track a delivery event with real-time processing
   */
  async trackEvent(event: Omit<DeliveryEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const deliveryEvent: DeliveryEvent = {
        ...event,
        id: `${event.emailId}_${event.eventType}_${Date.now()}`,
        timestamp: new Date(),
      };

      // Store in database
      await this.storeEventInDatabase(deliveryEvent);
      
      // Update real-time metrics in Redis
      await this.updateRealTimeMetrics(deliveryEvent);
      
      // Process webhooks and triggers
      await this.processEventTriggers(deliveryEvent);

      logger.info('Delivery event tracked', {
        emailId: event.emailId,
        campaignId: event.campaignId,
        eventType: event.eventType,
        provider: event.provider,
      });

    } catch (error) {
      logger.error('Failed to track delivery event', error as Error, {
        emailId: event.emailId,
        eventType: event.eventType,
      });
    }
  }

  /**
   * Get comprehensive delivery analytics
   */
  async getAnalytics(
    organizationId: string,
    options: {
      campaignId?: string;
      startDate?: Date;
      endDate?: Date;
      granularity?: 'hour' | 'day' | 'week' | 'month';
    } = {}
  ): Promise<DeliveryAnalytics> {
    const {
      campaignId,
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate = new Date(),
      granularity = 'day',
    } = options;

    const cacheKey = `analytics:${organizationId}:${campaignId || 'all'}:${startDate.getTime()}:${endDate.getTime()}:${granularity}`;
    
    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      // Get basic metrics
      const metrics = await this.calculateMetrics(organizationId, campaignId, startDate, endDate);
      
      // Get trend data
      const trends = await this.calculateTrends(organizationId, campaignId, startDate, endDate, granularity);
      
      // Get breakdown data
      const breakdown = await this.calculateBreakdowns(organizationId, campaignId, startDate, endDate);

      const analytics: DeliveryAnalytics = {
        organizationId,
        campaignId,
        timeRange: { start: startDate, end: endDate },
        metrics,
        trends,
        breakdown,
      };

      // Cache for 5 minutes
      await this.redis.setex(cacheKey, 300, JSON.stringify(analytics));

      return analytics;

    } catch (error) {
      logger.error('Failed to get delivery analytics', error as Error, {
        organizationId,
        campaignId,
      });
      throw error;
    }
  }

  /**
   * Get real-time delivery statistics
   */
  async getRealTimeStats(organizationId: string, campaignId?: string): Promise<RealTimeStats> {
    const cacheKey = `realtime:${organizationId}:${campaignId || 'all'}`;
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [lastHour, lastDay, lastWeek, lastMonth] = await Promise.all([
        this.calculateMetrics(organizationId, campaignId, oneHourAgo, now),
        this.calculateMetrics(organizationId, campaignId, oneDayAgo, now),
        this.calculateMetrics(organizationId, campaignId, oneWeekAgo, now),
        this.calculateMetrics(organizationId, campaignId, oneMonthAgo, now),
      ]);

      const stats: RealTimeStats = {
        lastHour,
        lastDay,
        lastWeek,
        lastMonth,
      };

      // Cache for 1 minute
      await this.redis.setex(cacheKey, 60, JSON.stringify(stats));

      return stats;

    } catch (error) {
      logger.error('Failed to get real-time stats', error as Error, {
        organizationId,
        campaignId,
      });
      throw error;
    }
  }

  /**
   * Store delivery event in database
   */
  private async storeEventInDatabase(event: DeliveryEvent): Promise<void> {
    await db.emailDeliveryEvent.create({
      data: {
        id: event.id,
        emailId: event.emailId,
        campaignId: event.campaignId,
        organizationId: event.organizationId,
        recipientEmail: event.recipientEmail,
        eventType: event.eventType,
        timestamp: event.timestamp,
        metadata: event.metadata || {},
        provider: event.provider,
        messageId: event.messageId,
        bounceType: event.bounceType,
        complaintType: event.complaintType,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress,
        location: event.location,
      },
    });
  }

  /**
   * Update real-time metrics in Redis
   */
  private async updateRealTimeMetrics(event: DeliveryEvent): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    // Increment counters for different time windows
    const timestamp = event.timestamp.getTime();
    const hourKey = `metrics:${event.organizationId}:${event.campaignId || 'all'}:hour:${Math.floor(timestamp / (60 * 60 * 1000))}`;
    const dayKey = `metrics:${event.organizationId}:${event.campaignId || 'all'}:day:${Math.floor(timestamp / (24 * 60 * 60 * 1000))}`;
    
    pipeline.hincrby(hourKey, event.eventType, 1);
    pipeline.expire(hourKey, 24 * 60 * 60); // Expire after 24 hours
    
    pipeline.hincrby(dayKey, event.eventType, 1);
    pipeline.expire(dayKey, 30 * 24 * 60 * 60); // Expire after 30 days
    
    // Update provider-specific metrics
    if (event.provider) {
      const providerKey = `provider:${event.organizationId}:${event.provider}:${Math.floor(timestamp / (24 * 60 * 60 * 1000))}`;
      pipeline.hincrby(providerKey, event.eventType, 1);
      pipeline.expire(providerKey, 30 * 24 * 60 * 60);
    }
    
    await pipeline.exec();
  }

  /**
   * Calculate delivery metrics
   */
  private async calculateMetrics(
    organizationId: string,
    campaignId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DeliveryMetrics> {
    const whereClause: any = {
      organizationId,
      ...(campaignId && { campaignId }),
      ...(startDate && endDate && {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const eventCounts = await db.emailDeliveryEvent.groupBy({
      by: ['eventType'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    const counts = eventCounts.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalSent = counts[DeliveryEventType.SENT] || 0;
    const totalDelivered = counts[DeliveryEventType.DELIVERED] || 0;
    const totalOpened = counts[DeliveryEventType.OPENED] || 0;
    const totalClicked = counts[DeliveryEventType.CLICKED] || 0;
    const totalBounced = counts[DeliveryEventType.BOUNCED] || 0;
    const totalComplaints = counts[DeliveryEventType.COMPLAINED] || 0;
    const totalUnsubscribed = counts[DeliveryEventType.UNSUBSCRIBED] || 0;

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalBounced,
      totalComplaints,
      totalUnsubscribed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      complaintRate: totalDelivered > 0 ? (totalComplaints / totalDelivered) * 100 : 0,
      unsubscribeRate: totalDelivered > 0 ? (totalUnsubscribed / totalDelivered) * 100 : 0,
    };
  }

  /**
   * Calculate trend data
   */
  private async calculateTrends(
    organizationId: string,
    campaignId?: string,
    startDate?: Date,
    endDate?: Date,
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<DeliveryAnalytics['trends']> {
    // Implementation for trend calculation based on granularity
    // This would involve grouping data by time intervals and calculating metrics
    
    return {
      deliveryTrend: [],
      openTrend: [],
      clickTrend: [],
      bounceTrend: [],
    };
  }

  /**
   * Calculate breakdown data
   */
  private async calculateBreakdowns(
    organizationId: string,
    campaignId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<DeliveryAnalytics['breakdown']> {
    // Implementation for various breakdowns
    // This would involve grouping by provider, time, location, device
    
    return {
      byProvider: {},
      byHour: {},
      byDay: {},
      byLocation: {},
      byDevice: {},
    };
  }

  /**
   * Process event triggers (webhooks, notifications, etc.)
   */
  private async processEventTriggers(event: DeliveryEvent): Promise<void> {
    // Handle bounces and complaints
    if (event.eventType === DeliveryEventType.BOUNCED || event.eventType === DeliveryEventType.COMPLAINED) {
      await this.handleBounceOrComplaint(event);
    }
    
    // Handle unsubscribes
    if (event.eventType === DeliveryEventType.UNSUBSCRIBED) {
      await this.handleUnsubscribe(event);
    }
    
    // Trigger campaign automation
    await this.triggerCampaignAutomation(event);
  }

  /**
   * Handle bounce or complaint events
   */
  private async handleBounceOrComplaint(event: DeliveryEvent): Promise<void> {
    // Update contact status
    await db.contact.updateMany({
      where: {
        email: event.recipientEmail,
        organizationId: event.organizationId,
      },
      data: {
        status: event.eventType === DeliveryEventType.BOUNCED ? 'BOUNCED' : 'COMPLAINED',
        updatedAt: new Date(),
      },
    });

    logger.info('Contact status updated due to bounce/complaint', {
      email: event.recipientEmail,
      eventType: event.eventType,
      organizationId: event.organizationId,
    });
  }

  /**
   * Handle unsubscribe events
   */
  private async handleUnsubscribe(event: DeliveryEvent): Promise<void> {
    // Update contact subscription status
    await db.contact.updateMany({
      where: {
        email: event.recipientEmail,
        organizationId: event.organizationId,
      },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.info('Contact unsubscribed', {
      email: event.recipientEmail,
      organizationId: event.organizationId,
    });
  }

  /**
   * Trigger campaign automation based on events
   */
  private async triggerCampaignAutomation(event: DeliveryEvent): Promise<void> {
    // This would integrate with campaign automation system
    // For now, just log the event
    logger.info('Campaign automation trigger', {
      eventType: event.eventType,
      campaignId: event.campaignId,
      recipientEmail: event.recipientEmail,
    });
  }

  /**
   * Get delivery health score
   */
  async getDeliveryHealthScore(organizationId: string, campaignId?: string): Promise<{
    score: number;
    factors: Record<string, { score: number; weight: number; impact: string }>;
    recommendations: string[];
  }> {
    const metrics = await this.calculateMetrics(organizationId, campaignId);
    
    const factors = {
      deliveryRate: {
        score: Math.min(metrics.deliveryRate, 100),
        weight: 0.3,
        impact: metrics.deliveryRate >= 95 ? 'positive' : metrics.deliveryRate >= 90 ? 'neutral' : 'negative',
      },
      bounceRate: {
        score: Math.max(0, 100 - metrics.bounceRate * 10),
        weight: 0.25,
        impact: metrics.bounceRate <= 2 ? 'positive' : metrics.bounceRate <= 5 ? 'neutral' : 'negative',
      },
      complaintRate: {
        score: Math.max(0, 100 - metrics.complaintRate * 20),
        weight: 0.25,
        impact: metrics.complaintRate <= 0.1 ? 'positive' : metrics.complaintRate <= 0.5 ? 'neutral' : 'negative',
      },
      openRate: {
        score: Math.min(metrics.openRate * 5, 100),
        weight: 0.1,
        impact: metrics.openRate >= 20 ? 'positive' : metrics.openRate >= 15 ? 'neutral' : 'negative',
      },
      clickRate: {
        score: Math.min(metrics.clickRate * 10, 100),
        weight: 0.1,
        impact: metrics.clickRate >= 3 ? 'positive' : metrics.clickRate >= 2 ? 'neutral' : 'negative',
      },
    };

    const score = Object.values(factors).reduce((total, factor) => {
      return total + (factor.score * factor.weight);
    }, 0);

    const recommendations: string[] = [];
    
    if (factors.deliveryRate.impact === 'negative') {
      recommendations.push('Improve email authentication (SPF, DKIM, DMARC)');
    }
    if (factors.bounceRate.impact === 'negative') {
      recommendations.push('Clean your email list and remove invalid addresses');
    }
    if (factors.complaintRate.impact === 'negative') {
      recommendations.push('Review email content and frequency');
    }
    if (factors.openRate.impact === 'negative') {
      recommendations.push('Optimize subject lines and send times');
    }
    if (factors.clickRate.impact === 'negative') {
      recommendations.push('Improve email content and call-to-action placement');
    }

    return {
      score: Math.round(score),
      factors,
      recommendations,
    };
  }

  /**
   * Export delivery data for analysis
   */
  async exportDeliveryData(
    organizationId: string,
    options: {
      campaignId?: string;
      startDate?: Date;
      endDate?: Date;
      format: 'csv' | 'json';
      includeMetadata?: boolean;
    }
  ): Promise<string> {
    const whereClause: any = {
      organizationId,
      ...(options.campaignId && { campaignId: options.campaignId }),
      ...(options.startDate && options.endDate && {
        timestamp: {
          gte: options.startDate,
          lte: options.endDate,
        },
      }),
    };

    const events = await db.emailDeliveryEvent.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 50000, // Limit to prevent memory issues
    });

    if (options.format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      // Convert to CSV
      const headers = [
        'id', 'emailId', 'campaignId', 'recipientEmail', 'eventType',
        'timestamp', 'provider', 'messageId'
      ];
      
      if (options.includeMetadata) {
        headers.push('metadata');
      }

      const csvRows = [
        headers.join(','),
        ...events.map((event: any) => [
          event.id,
          event.emailId,
          event.campaignId,
          event.recipientEmail,
          event.eventType,
          event.timestamp.toISOString(),
          event.provider || '',
          event.messageId || '',
          ...(options.includeMetadata ? [JSON.stringify(event.metadata)] : [])
        ].map(field => `"${field}"`).join(','))
      ];

      return csvRows.join('\n');
    }
  }

  /**
   * Clean up old tracking data
   */
  async cleanupOldData(retentionDays: number = 90): Promise<{ deletedRecords: number }> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await db.emailDeliveryEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    logger.info('Cleaned up old delivery tracking data', {
      deletedRecords: result.count,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays,
    });

    return { deletedRecords: result.count };
  }

  /**
   * Get system health status
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    database: boolean;
    redis: boolean;
    recentEvents: number;
    errorRate: number;
  }> {
    try {
      // Check database connectivity
      const dbTest = await db.emailDeliveryEvent.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });

      // Check Redis connectivity
      await this.redis.ping();

      const recentEvents = dbTest;
      const errorRate = 0; // Would be calculated from actual error metrics

      return {
        healthy: true,
        database: true,
        redis: true,
        recentEvents,
        errorRate,
      };

    } catch (error) {
      logger.error('Delivery tracker health check failed', error as Error);
      
      return {
        healthy: false,
        database: false,
        redis: false,
        recentEvents: 0,
        errorRate: 100,
      };
    }
  }
}

// Export singleton instance
export const deliveryTracker = new DeliveryTracker();