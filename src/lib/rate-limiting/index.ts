import { AdvancedRateLimiter, createRateLimitConfig } from './advanced-rate-limiter';
import { RateLimitMiddleware, createRateLimitMiddlewareConfig } from './rate-limit-middleware';
import { logger } from '../utils/logger';

// Global rate limiter instance
let globalRateLimiter: AdvancedRateLimiter | null = null;
let globalRateLimitMiddleware: RateLimitMiddleware | null = null;

/**
 * Initialize the global rate limiting system
 */
export function initializeRateLimiting(): {
  rateLimiter: AdvancedRateLimiter;
  rateLimitMiddleware: RateLimitMiddleware;
} {
  if (!globalRateLimiter) {
    const config = createRateLimitConfig();
    globalRateLimiter = new AdvancedRateLimiter(config);
    
    const middlewareConfig = createRateLimitMiddlewareConfig();
    globalRateLimitMiddleware = new RateLimitMiddleware(globalRateLimiter, middlewareConfig);
    
    logger.info('Global rate limiting system initialized', {
      redisHost: config.redis.host,
      redisPort: config.redis.port,
      defaultRequests: config.defaultLimits.requests,
      defaultWindowMs: config.defaultLimits.windowMs,
      adaptiveScaling: config.adaptiveScaling.enabled,
      circuitBreaker: config.circuitBreaker.enabled,
    });
  }

  return {
    rateLimiter: globalRateLimiter,
    rateLimitMiddleware: globalRateLimitMiddleware!,
  };
}

/**
 * Get the global rate limiter instance
 */
export function getRateLimiter(): AdvancedRateLimiter {
  if (!globalRateLimiter) {
    const { rateLimiter } = initializeRateLimiting();
    return rateLimiter;
  }
  return globalRateLimiter;
}

/**
 * Get the global rate limit middleware instance
 */
export function getRateLimitMiddleware(): RateLimitMiddleware {
  if (!globalRateLimitMiddleware) {
    const { rateLimitMiddleware } = initializeRateLimiting();
    return rateLimitMiddleware;
  }
  return globalRateLimitMiddleware;
}

/**
 * High-level rate limiting service
 */
export class RateLimitService {
  private middleware: RateLimitMiddleware;

  constructor() {
    this.middleware = getRateLimitMiddleware();
  }

  /**
   * Email-specific rate limiting
   */
  async checkEmailSending(
    organizationId: string,
    recipientCount: number,
    options: {
      userId?: string;
      campaignId?: string;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<{
    allowed: boolean;
    delayRecommendation?: number;
    batchSize?: number;
    result: any;
  }> {
    if (recipientCount > 1000) {
      // Use bulk email campaign limits
      return this.middleware.checkEmailCampaign(
        options.campaignId || 'bulk-send',
        recipientCount,
        {
          organizationId,
          userId: options.userId,
          campaignType: 'bulk',
          priority: options.priority,
        }
      );
    } else {
      // Use regular email sending limits
      const result = await this.middleware.checkAPIEndpoint(
        'email-send',
        'POST',
        {
          organizationId,
          userId: options.userId,
        }
      );

      return {
        allowed: result.allowed,
        result: result.result,
      };
    }
  }

  /**
   * Bulk operation rate limiting
   */
  async checkBulkOperation(
    operation: string,
    items: any[],
    organizationId: string,
    options: {
      userId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<{
    allowed: boolean;
    blockedItems: any[];
    allowedItems: any[];
    rateLimitResults: any[];
  }> {
    return this.middleware.checkBulkOperation(
      operation,
      items,
      {
        organizationId,
        userId: options.userId,
        metadata: options.metadata,
      }
    );
  }

  /**
   * Database operation rate limiting
   */
  async checkDatabaseOperation(
    operation: string,
    organizationId: string,
    options: {
      userId?: string;
      queryType?: string;
      estimatedComplexity?: number;
    } = {}
  ): Promise<{
    allowed: boolean;
    result: any;
  }> {
    return this.middleware.checkDatabaseOperation(
      operation,
      {
        organizationId,
        userId: options.userId,
        queryType: options.queryType,
        estimatedComplexity: options.estimatedComplexity,
      }
    );
  }

  /**
   * API endpoint rate limiting
   */
  async checkAPIAccess(
    endpoint: string,
    method: string,
    organizationId: string,
    options: {
      userId?: string;
      clientIp?: string;
      userAgent?: string;
    } = {}
  ): Promise<{
    allowed: boolean;
    result: any;
  }> {
    return this.middleware.checkAPIEndpoint(
      endpoint,
      method,
      {
        organizationId,
        userId: options.userId,
        clientIp: options.clientIp,
        userAgent: options.userAgent,
      }
    );
  }

  /**
   * Campaign-specific rate limiting
   */
  async checkCampaignOperation(
    campaignId: string,
    operation: string,
    organizationId: string,
    options: {
      userId?: string;
      recipientCount?: number;
      campaignType?: string;
    } = {}
  ): Promise<{
    allowed: boolean;
    result: any;
    recommendations?: {
      delay?: number;
      batchSize?: number;
      throttleRate?: number;
    };
  }> {
    const result = await this.middleware.checkAPIEndpoint(
      `campaign-${operation}`,
      'POST',
      {
        organizationId,
        userId: options.userId,
      }
    );

    let recommendations: any = {};

    if (!result.allowed && options.recipientCount) {
      // Provide recommendations for large campaigns
      if (options.recipientCount > 10000) {
        recommendations = {
          delay: 300000, // 5 minutes
          batchSize: Math.floor(options.recipientCount / 20), // 20 batches
          throttleRate: 100, // 100 emails per second
        };
      } else if (options.recipientCount > 1000) {
        recommendations = {
          delay: 60000, // 1 minute
          batchSize: Math.floor(options.recipientCount / 10), // 10 batches
          throttleRate: 50, // 50 emails per second
        };
      }
    }

    return {
      allowed: result.allowed,
      result: result.result,
      recommendations: Object.keys(recommendations).length > 0 ? recommendations : undefined,
    };
  }

  /**
   * User action rate limiting
   */
  async checkUserAction(
    action: string,
    userId: string,
    organizationId: string,
    options: {
      metadata?: Record<string, any>;
    } = {}
  ): Promise<{
    allowed: boolean;
    result: any;
  }> {
    return this.middleware.checkAPIEndpoint(
      `user-${action}`,
      'POST',
      {
        organizationId,
        userId,
      }
    );
  }

  /**
   * Get rate limit status for organization
   */
  async getOrganizationStatus(organizationId: string): Promise<{
    [operation: string]: any;
  }> {
    const operations = [
      'email-send',
      'bulk-email',
      'campaign-send',
      'api-general',
      'db-operations',
    ];

    const statusPromises = operations.map(async (operation) => {
      const key = `org:${organizationId}:${operation}`;
      const status = await this.middleware.getStatus(key);
      return { operation, status };
    });

    const results = await Promise.all(statusPromises);
    
    const statusMap: { [operation: string]: any } = {};
    results.forEach(({ operation, status }) => {
      statusMap[operation] = status;
    });

    return statusMap;
  }

  /**
   * Reset rate limits for organization
   */
  async resetOrganizationLimits(organizationId: string): Promise<{
    success: boolean;
    resetCount: number;
  }> {
    try {
      const key = `org:${organizationId}`;
      const success = await this.middleware.resetLimit(key);
      
      logger.info('Organization rate limits reset', { organizationId, success });
      
      return {
        success,
        resetCount: success ? 1 : 0,
      };
    } catch (error) {
      logger.error('Failed to reset organization rate limits', error as Error, { organizationId });
      return {
        success: false,
        resetCount: 0,
      };
    }
  }

  /**
   * Get comprehensive rate limiting metrics
   */
  async getMetrics(): Promise<any> {
    return this.middleware.getMetrics();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    return this.middleware.healthCheck();
  }

  /**
   * Get rate limiting recommendations for bulk operations
   */
  getBulkOperationRecommendations(
    itemCount: number,
    operation: string
  ): {
    recommendedBatchSize: number;
    recommendedDelay: number;
    estimatedDuration: number;
    throttleRate: number;
  } {
    let recommendedBatchSize: number;
    let recommendedDelay: number;
    let throttleRate: number;

    // Base recommendations on item count and operation type
    if (itemCount > 100000) {
      recommendedBatchSize = 1000;
      recommendedDelay = 30000; // 30 seconds
      throttleRate = 20; // 20 items per second
    } else if (itemCount > 10000) {
      recommendedBatchSize = 500;
      recommendedDelay = 15000; // 15 seconds
      throttleRate = 50; // 50 items per second
    } else if (itemCount > 1000) {
      recommendedBatchSize = 100;
      recommendedDelay = 5000; // 5 seconds
      throttleRate = 100; // 100 items per second
    } else {
      recommendedBatchSize = 50;
      recommendedDelay = 1000; // 1 second
      throttleRate = 200; // 200 items per second
    }

    // Adjust for specific operations
    if (operation === 'email-send') {
      throttleRate = Math.min(throttleRate, 100); // Email sending is more intensive
    } else if (operation === 'db-write') {
      throttleRate = Math.min(throttleRate, 50); // Database writes are intensive
    }

    const batchCount = Math.ceil(itemCount / recommendedBatchSize);
    const estimatedDuration = (batchCount * recommendedDelay) + (itemCount / throttleRate * 1000);

    return {
      recommendedBatchSize,
      recommendedDelay,
      estimatedDuration,
      throttleRate,
    };
  }
}

// Export singleton rate limit service
export const rateLimitService = new RateLimitService();

// Export all rate limiting classes and functions
export { 
  AdvancedRateLimiter, 
  RateLimitMiddleware, 
  createRateLimitConfig,
  createRateLimitMiddlewareConfig 
};
export type { 
  RateLimitConfig, 
  RateLimitRule, 
  RateLimitContext, 
  RateLimitResult,
  RateLimitMiddlewareConfig 
};