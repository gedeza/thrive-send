import { analyticsCacheManager } from './cache-manager';

/**
 * Cache invalidation service for analytics data
 * Automatically invalidates relevant cache entries when data changes
 */

export class AnalyticsCacheInvalidationService {
  /**
   * Invalidate cache when content is created, updated, or deleted
   */
  async invalidateContentCache(params: {
    userId: string;
    organizationId?: string;
    contentId?: string;
  }): Promise<void> {
    const { userId, organizationId, contentId } = params;
    
    // Invalidate user-specific cache
    await analyticsCacheManager.invalidateUserCache(userId);
    
    // Invalidate organization cache if provided
    if (organizationId) {
      await analyticsCacheManager.invalidateOrganizationCache(organizationId);
    }
    
    // Invalidate specific content cache patterns
    await analyticsCacheManager.invalidatePattern(`*content:${contentId}*`);
    await analyticsCacheManager.invalidatePattern(`*user:${userId}*`);
    
    console.log(`Cache invalidated for content change - User: ${userId}, Org: ${organizationId}, Content: ${contentId}`);
  }

  /**
   * Invalidate cache when campaign is created, updated, or deleted
   */
  async invalidateCampaignCache(params: {
    campaignId: string;
    organizationId: string;
    userId?: string;
  }): Promise<void> {
    const { campaignId, organizationId, userId } = params;
    
    // Invalidate campaign-specific cache
    await analyticsCacheManager.invalidateCampaignCache(campaignId);
    
    // Invalidate organization cache
    await analyticsCacheManager.invalidateOrganizationCache(organizationId);
    
    // Invalidate user cache if provided
    if (userId) {
      await analyticsCacheManager.invalidateUserCache(userId);
    }
    
    console.log(`Cache invalidated for campaign change - Campaign: ${campaignId}, Org: ${organizationId}, User: ${userId}`);
  }

  /**
   * Invalidate cache when analytics data is updated
   */
  async invalidateAnalyticsCache(params: {
    organizationId: string;
    campaignId?: string;
    clientId?: string;
  }): Promise<void> {
    const { organizationId, campaignId, clientId } = params;
    
    // Invalidate organization cache
    await analyticsCacheManager.invalidateOrganizationCache(organizationId);
    
    // Invalidate campaign cache if provided
    if (campaignId) {
      await analyticsCacheManager.invalidateCampaignCache(campaignId);
    }
    
    // Invalidate client-specific cache
    if (clientId) {
      await analyticsCacheManager.invalidatePattern(`*client:${clientId}*`);
    }
    
    console.log(`Cache invalidated for analytics change - Org: ${organizationId}, Campaign: ${campaignId}, Client: ${clientId}`);
  }

  /**
   * Invalidate cache when user joins or leaves an organization
   */
  async invalidateOrganizationMembershipCache(params: {
    userId: string;
    organizationId: string;
  }): Promise<void> {
    const { userId, organizationId } = params;
    
    // Invalidate both user and organization cache
    await analyticsCacheManager.invalidateUserCache(userId);
    await analyticsCacheManager.invalidateOrganizationCache(organizationId);
    
    console.log(`Cache invalidated for organization membership change - User: ${userId}, Org: ${organizationId}`);
  }

  /**
   * Invalidate all cache for a specific time range
   * Useful for bulk data updates or maintenance
   */
  async invalidateTimeRangeCache(params: {
    startDate: Date;
    endDate: Date;
    organizationId?: string;
  }): Promise<void> {
    const { startDate, endDate, organizationId } = params;
    
    // Create patterns for time-based cache invalidation
    const patterns = [
      `*start:${startDate.toISOString()}*`,
      `*end:${endDate.toISOString()}*`,
      `*timeRange:*`, // Invalidate all time range queries
    ];
    
    if (organizationId) {
      patterns.push(`*org:${organizationId}*`);
    }
    
    // Invalidate all matching patterns
    await Promise.all(patterns.map(pattern => 
      analyticsCacheManager.invalidatePattern(pattern)
    ));
    
    console.log(`Cache invalidated for time range - Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}, Org: ${organizationId}`);
  }

  /**
   * Scheduled cache maintenance
   * Should be called periodically to clean up stale cache entries
   */
  async performCacheMaintenance(): Promise<void> {
    try {
      const stats = await analyticsCacheManager.getStats();
      console.log('Cache maintenance started', stats);
      
      // Clean up expired entries (this is handled automatically by Redis TTL)
      // For memory cache, cleanup is handled by the internal cleanup interval
      
      console.log('Cache maintenance completed');
    } catch (_error) {
      console.error("", _error);
    }
  }

  /**
   * Get cache health status
   */
  async getCacheHealthStatus(): Promise<{
    isHealthy: boolean;
    stats: any;
    lastMaintenanceRun?: Date;
  }> {
    try {
      const stats = await analyticsCacheManager.getStats();
      return {
        isHealthy: stats.isAvailable,
        stats,
        lastMaintenanceRun: new Date(),
      };
    } catch (_error) {
      console.error("", _error);
      return {
        isHealthy: false,
        stats: null,
      };
    }
  }
}

// Export singleton instance
export const analyticsCacheInvalidation = new AnalyticsCacheInvalidationService();

/**
 * Middleware function to automatically invalidate cache on data changes
 */
export function withCacheInvalidation(
  invalidationType: 'content' | 'campaign' | 'analytics' | 'membership'
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Invalidate cache based on type
      try {
        const params = args[0] || {};
        
        switch (invalidationType) {
          case 'content':
            await analyticsCacheInvalidation.invalidateContentCache(params);
            break;
          case 'campaign':
            await analyticsCacheInvalidation.invalidateCampaignCache(params);
            break;
          case 'analytics':
            await analyticsCacheInvalidation.invalidateAnalyticsCache(params);
            break;
          case 'membership':
            await analyticsCacheInvalidation.invalidateOrganizationMembershipCache(params);
            break;
        }
      } catch (_error) {
        console.error("", _error);
        // Don't fail the original operation if cache invalidation fails
      }
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Smart cache warming functions
 */
export class AnalyticsCacheWarmer {
  /**
   * Warm cache for a specific user's most common queries
   */
  async warmUserCache(userId: string, clerkId: string): Promise<void> {
    try {
      // Import the optimized functions
      const { getOptimizedAnalytics, getOptimizedAnalyticsOverview } = await import('./query-optimizer');
      
      // Common time ranges to warm
      const timeRanges = ['7d', '30d'];
      const now = new Date();
      
      for (const timeRange of timeRanges) {
        const days = parseInt(timeRange.replace('d', ''));
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        
        // Warm metrics cache
        await getOptimizedAnalytics({
          userId,
          clerkId,
          startDate,
          endDate: now,
          timeframe: timeRange
        });
        
        // Warm overview cache
        await getOptimizedAnalyticsOverview({
          userId,
          clerkId,
          timeRange,
          platform: 'all'
        });
      }
      
      console.log(`Cache warmed for user: ${userId}`);
    } catch (_error) {
      console.error("", _error);
    }
  }

  /**
   * Warm cache for an organization's common queries
   */
  async warmOrganizationCache(organizationId: string): Promise<void> {
    try {
      // Get organization users
      const { prisma } = await import('@/lib/prisma');
      const orgMembers = await prisma.organizationMember.findMany({
        where: { organizationId },
        include: { user: true }
      });
      
      // Warm cache for each user
      await Promise.all(
        orgMembers.map(member => 
          this.warmUserCache(member.user.id, member.user.clerkId)
        )
      );
      
      console.log(`Cache warmed for organization: ${organizationId}`);
    } catch (_error) {
      console.error("", _error);
    }
  }
}

export const analyticsCacheWarmer = new AnalyticsCacheWarmer();