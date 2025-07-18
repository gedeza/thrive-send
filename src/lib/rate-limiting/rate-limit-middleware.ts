import { NextRequest, NextResponse } from 'next/server';
import { AdvancedRateLimiter, RateLimitContext } from './advanced-rate-limiter';
import { logger } from '../utils/logger';

export interface RateLimitMiddlewareConfig {
  enabled: boolean;
  skipPatterns: string[];
  headerPrefix: string;
  blockingEnabled: boolean;
  customKeyGenerator?: (req: NextRequest) => string;
  customContextBuilder?: (req: NextRequest) => Partial<RateLimitContext>;
}

export class RateLimitMiddleware {
  private rateLimiter: AdvancedRateLimiter;
  private config: RateLimitMiddlewareConfig;

  constructor(rateLimiter: AdvancedRateLimiter, config: RateLimitMiddlewareConfig) {
    this.rateLimiter = rateLimiter;
    this.config = config;
  }

  /**
   * Next.js API route rate limiting middleware
   */
  withRateLimit(
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
    options: {
      operation: string;
      keyGenerator?: (req: NextRequest, context: any) => string;
      contextBuilder?: (req: NextRequest, context: any) => Partial<RateLimitContext>;
      onLimit?: (context: RateLimitContext, req: NextRequest) => Promise<NextResponse>;
      skipCondition?: (req: NextRequest) => boolean;
    }
  ) {
    return async (req: NextRequest, context: any): Promise<NextResponse> => {
      // Skip rate limiting if disabled or conditions met
      if (!this.config.enabled || this.shouldSkipRateLimit(req, options)) {
        return handler(req, context);
      }

      try {
        // Build rate limit context
        const rateLimitContext = this.buildContext(req, context, options);

        // Check rate limit
        const result = await this.rateLimiter.checkLimit(rateLimitContext);

        // Add rate limit headers
        let response: NextResponse;
        
        if (result.allowed) {
          // Execute handler
          response = await handler(req, context);
        } else {
          // Handle rate limit exceeded
          if (options.onLimit) {
            response = await options.onLimit(rateLimitContext, req);
          } else {
            response = this.createRateLimitResponse(result);
          }
        }

        // Add rate limit headers to response
        this.addRateLimitHeaders(response, result);

        return response;

      } catch (error) {
        logger.error('Rate limit middleware error', error as Error, { 
          url: req.url,
          operation: options.operation,
        });
        
        // Continue with handler on error (fail open)
        return handler(req, context);
      }
    };
  }

  /**
   * Bulk operation rate limiting
   */
  async checkBulkOperation(
    operation: string,
    items: any[],
    options: {
      organizationId?: string;
      userId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<{
    allowed: boolean;
    blockedItems: any[];
    allowedItems: any[];
    rateLimitResults: any[];
  }> {
    try {
      // Create contexts for each item
      const contexts: RateLimitContext[] = items.map((item, index) => ({
        key: `${options.organizationId || 'unknown'}:${operation}:${index}`,
        userId: options.userId,
        organizationId: options.organizationId,
        operation,
        metadata: {
          ...options.metadata,
          itemIndex: index,
          totalItems: items.length,
        },
        timestamp: Date.now(),
      }));

      // Check rate limits for all contexts
      const results = await this.rateLimiter.checkBulkLimits(contexts);

      // Separate allowed and blocked items
      const allowedItems: any[] = [];
      const blockedItems: any[] = [];

      results.forEach((result, index) => {
        if (result.allowed) {
          allowedItems.push(items[index]);
        } else {
          blockedItems.push(items[index]);
        }
      });

      const overallAllowed = blockedItems.length === 0;

      logger.info('Bulk operation rate limit check', {
        operation,
        totalItems: items.length,
        allowedItems: allowedItems.length,
        blockedItems: blockedItems.length,
        overallAllowed,
      });

      return {
        allowed: overallAllowed,
        allowedItems,
        blockedItems,
        rateLimitResults: results,
      };

    } catch (error) {
      logger.error('Bulk operation rate limit check failed', error as Error, {
        operation,
        itemCount: items.length,
      });

      // Fail open - allow all items
      return {
        allowed: true,
        allowedItems: items,
        blockedItems: [],
        rateLimitResults: [],
      };
    }
  }

  /**
   * Email campaign rate limiting
   */
  async checkEmailCampaign(
    campaignId: string,
    recipientCount: number,
    options: {
      organizationId?: string;
      userId?: string;
      campaignType?: string;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): Promise<{
    allowed: boolean;
    delayRecommendation?: number;
    batchSize?: number;
    result: any;
  }> {
    try {
      const context: RateLimitContext = {
        key: `${options.organizationId || 'unknown'}:email-campaign:${campaignId}`,
        userId: options.userId,
        organizationId: options.organizationId,
        operation: 'email-campaign',
        metadata: {
          campaignId,
          recipientCount,
          campaignType: options.campaignType || 'standard',
          priority: options.priority || 'medium',
        },
        timestamp: Date.now(),
      };

      const result = await this.rateLimiter.checkLimit(context);

      let delayRecommendation: number | undefined;
      let batchSize: number | undefined;

      if (!result.allowed) {
        // Calculate recommended delay based on reset time
        delayRecommendation = result.retryAfter || 0;
        
        // Suggest batch size based on recipient count and limits
        if (recipientCount > 1000) {
          batchSize = Math.floor(recipientCount / 10); // Split into 10 batches
        }
      }

      logger.info('Email campaign rate limit check', {
        campaignId,
        recipientCount,
        allowed: result.allowed,
        delayRecommendation,
        batchSize,
      });

      return {
        allowed: result.allowed,
        delayRecommendation,
        batchSize,
        result,
      };

    } catch (error) {
      logger.error('Email campaign rate limit check failed', error as Error, {
        campaignId,
        recipientCount,
      });

      // Fail open
      return {
        allowed: true,
        result: null,
      };
    }
  }

  /**
   * Database operation rate limiting
   */
  async checkDatabaseOperation(
    operation: string,
    options: {
      organizationId?: string;
      userId?: string;
      queryType?: string;
      estimatedComplexity?: number;
    } = {}
  ): Promise<{
    allowed: boolean;
    result: any;
  }> {
    try {
      const context: RateLimitContext = {
        key: `${options.organizationId || 'global'}:db-${operation}`,
        userId: options.userId,
        organizationId: options.organizationId,
        operation: `db-${operation}`,
        metadata: {
          queryType: options.queryType || 'unknown',
          estimatedComplexity: options.estimatedComplexity || 1,
        },
        timestamp: Date.now(),
      };

      const result = await this.rateLimiter.checkLimit(context);

      logger.debug('Database operation rate limit check', {
        operation,
        allowed: result.allowed,
        remaining: result.remaining,
      });

      return {
        allowed: result.allowed,
        result,
      };

    } catch (error) {
      logger.error('Database operation rate limit check failed', error as Error, {
        operation,
      });

      // Fail open for database operations
      return {
        allowed: true,
        result: null,
      };
    }
  }

  /**
   * API endpoint rate limiting
   */
  async checkAPIEndpoint(
    endpoint: string,
    method: string,
    options: {
      organizationId?: string;
      userId?: string;
      clientIp?: string;
      userAgent?: string;
    } = {}
  ): Promise<{
    allowed: boolean;
    result: any;
  }> {
    try {
      const context: RateLimitContext = {
        key: `${options.organizationId || options.clientIp || 'unknown'}:api-${endpoint}`,
        userId: options.userId,
        organizationId: options.organizationId,
        operation: `api-${endpoint}`,
        metadata: {
          method,
          endpoint,
          clientIp: options.clientIp,
          userAgent: options.userAgent,
        },
        timestamp: Date.now(),
      };

      const result = await this.rateLimiter.checkLimit(context);

      logger.debug('API endpoint rate limit check', {
        endpoint,
        method,
        allowed: result.allowed,
        remaining: result.remaining,
      });

      return {
        allowed: result.allowed,
        result,
      };

    } catch (error) {
      logger.error('API endpoint rate limit check failed', error as Error, {
        endpoint,
        method,
      });

      // Fail open for API endpoints
      return {
        allowed: true,
        result: null,
      };
    }
  }

  /**
   * Get rate limit status for a key
   */
  async getStatus(key: string): Promise<any> {
    return this.rateLimiter.getStatus(key);
  }

  /**
   * Reset rate limit for a key
   */
  async resetLimit(key: string): Promise<boolean> {
    return this.rateLimiter.resetLimit(key);
  }

  /**
   * Get rate limiting metrics
   */
  getMetrics(): any {
    return this.rateLimiter.getMetrics();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    return this.rateLimiter.healthCheck();
  }

  // Private helper methods

  private shouldSkipRateLimit(req: NextRequest, options: any): boolean {
    // Check skip condition
    if (options.skipCondition && options.skipCondition(req)) {
      return true;
    }

    // Check skip patterns
    return this.config.skipPatterns.some(pattern => 
      new RegExp(pattern).test(req.url)
    );
  }

  private buildContext(
    req: NextRequest,
    context: any,
    options: any
  ): RateLimitContext {
    const baseContext: RateLimitContext = {
      key: options.keyGenerator 
        ? options.keyGenerator(req, context)
        : this.generateDefaultKey(req, context),
      operation: options.operation,
      timestamp: Date.now(),
    };

    // Add custom context
    if (options.contextBuilder) {
      const customContext = options.contextBuilder(req, context);
      Object.assign(baseContext, customContext);
    }

    // Add global custom context
    if (this.config.customContextBuilder) {
      const globalContext = this.config.customContextBuilder(req);
      Object.assign(baseContext, globalContext);
    }

    return baseContext;
  }

  private generateDefaultKey(req: NextRequest, context: any): string {
    if (this.config.customKeyGenerator) {
      return this.config.customKeyGenerator(req);
    }

    // Extract identifiers from request
    const organizationId = req.headers.get('X-Organization-Id') || 'unknown';
    const userId = req.headers.get('X-User-Id') || 'unknown';
    const clientIp = req.headers.get('X-Forwarded-For') || 
                    req.headers.get('X-Real-IP') || 
                    'unknown';

    // Use organization ID if available, otherwise fallback to user ID or IP
    if (organizationId !== 'unknown') {
      return `org:${organizationId}`;
    } else if (userId !== 'unknown') {
      return `user:${userId}`;
    } else {
      return `ip:${clientIp}`;
    }
  }

  private createRateLimitResponse(result: any): NextResponse {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter || 0,
        resetTime: result.resetTime,
      },
      { status: 429 }
    );

    return response;
  }

  private addRateLimitHeaders(response: NextResponse, result: any): void {
    const prefix = this.config.headerPrefix;
    
    response.headers.set(`${prefix}-Limit`, result.rule?.limits.requests.toString() || '0');
    response.headers.set(`${prefix}-Remaining`, result.remaining.toString());
    response.headers.set(`${prefix}-Reset`, result.resetTime.toString());
    
    if (result.retryAfter) {
      response.headers.set(`${prefix}-Retry-After`, result.retryAfter.toString());
    }
    
    if (result.rule) {
      response.headers.set(`${prefix}-Rule`, result.rule.id);
    }
  }
}

// Export default middleware configuration
export const createRateLimitMiddlewareConfig = (): RateLimitMiddlewareConfig => ({
  enabled: process.env.RATE_LIMIT_MIDDLEWARE_ENABLED !== 'false',
  skipPatterns: [
    '/api/health',
    '/api/metrics',
    '/api/auth/callback',
    '.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$',
  ],
  headerPrefix: 'X-RateLimit',
  blockingEnabled: process.env.RATE_LIMIT_BLOCKING_ENABLED !== 'false',
  customKeyGenerator: (req: NextRequest) => {
    const organizationId = req.headers.get('X-Organization-Id');
    const userId = req.headers.get('X-User-Id');
    const clientIp = req.headers.get('X-Forwarded-For') || 
                    req.headers.get('X-Real-IP') || 
                    'unknown';

    if (organizationId) {
      return `org:${organizationId}`;
    } else if (userId) {
      return `user:${userId}`;
    } else {
      return `ip:${clientIp}`;
    }
  },
  customContextBuilder: (req: NextRequest) => {
    return {
      organizationId: req.headers.get('X-Organization-Id') || undefined,
      userId: req.headers.get('X-User-Id') || undefined,
      metadata: {
        userAgent: req.headers.get('User-Agent') || undefined,
        clientIp: req.headers.get('X-Forwarded-For') || 
                 req.headers.get('X-Real-IP') || 
                 undefined,
      },
    };
  },
});