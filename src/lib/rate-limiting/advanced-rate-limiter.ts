import Redis from 'ioredis';
import { logger } from '../utils/logger';

export interface RateLimitConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  };
  defaultLimits: {
    requests: number;
    windowMs: number;
    burst: number;
  };
  adaptiveScaling: {
    enabled: boolean;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    maxScaleFactor: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeoutMs: number;
    monitoringWindowMs: number;
  };
}

export interface RateLimitRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  matcher: (context: RateLimitContext) => boolean;
  limits: {
    requests: number;
    windowMs: number;
    burst?: number;
  };
  actions: {
    onLimit?: (context: RateLimitContext) => Promise<void>;
    onReset?: (context: RateLimitContext) => Promise<void>;
  };
}

export interface RateLimitContext {
  key: string;
  userId?: string;
  organizationId?: string;
  operation: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  rule?: RateLimitRule;
  metadata?: Record<string, any>;
}

export interface RateLimitMetrics {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  avgResponseTime: number;
  circuitBreakerTrips: number;
  adaptiveScalingEvents: number;
  ruleHits: Record<string, number>;
}

export class AdvancedRateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;
  private rules: Map<string, RateLimitRule> = new Map();
  private metrics: RateLimitMetrics;
  private circuitBreakerState: Map<string, {
    failures: number;
    lastFailure: number;
    state: 'closed' | 'open' | 'half-open';
  }> = new Map();

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.metrics = {
      totalRequests: 0,
      allowedRequests: 0,
      blockedRequests: 0,
      avgResponseTime: 0,
      circuitBreakerTrips: 0,
      adaptiveScalingEvents: 0,
      ruleHits: {},
    };

    this.initializeRedis();
    this.initializeDefaultRules();
    this.startMetricsCollection();
  }

  private initializeRedis(): void {
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      db: this.config.redis.db,
      keyPrefix: this.config.redis.keyPrefix,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      logger.info('Rate limiter Redis connected');
    });

    this.redis.on('error', (error) => {
      logger.error('Rate limiter Redis error', error);
    });
  }

  private initializeDefaultRules(): void {
    // Email sending rate limits
    this.addRule({
      id: 'email-sending-basic',
      name: 'Basic Email Sending',
      description: 'Standard email sending rate limit',
      priority: 1,
      matcher: (context) => context.operation === 'email-send',
      limits: {
        requests: 1000,
        windowMs: 60000, // 1 minute
        burst: 100,
      },
      actions: {
        onLimit: async (context) => {
          logger.warn('Email sending rate limit exceeded', { context });
        },
      },
    });

    // Bulk email campaigns
    this.addRule({
      id: 'bulk-email-campaign',
      name: 'Bulk Email Campaign',
      description: 'Rate limit for bulk email campaigns',
      priority: 2,
      matcher: (context) => 
        context.operation === 'bulk-email' && 
        (context.metadata?.recipientCount || 0) > 1000,
      limits: {
        requests: 10,
        windowMs: 300000, // 5 minutes
        burst: 3,
      },
      actions: {
        onLimit: async (context) => {
          logger.warn('Bulk email campaign rate limit exceeded', { context });
        },
      },
    });

    // API endpoints
    this.addRule({
      id: 'api-general',
      name: 'General API',
      description: 'General API rate limiting',
      priority: 3,
      matcher: (context) => context.operation.startsWith('api-'),
      limits: {
        requests: 10000,
        windowMs: 60000, // 1 minute
        burst: 500,
      },
      actions: {},
    });

    // Organization-specific limits
    this.addRule({
      id: 'organization-bulk-operations',
      name: 'Organization Bulk Operations',
      description: 'Rate limit for organization bulk operations',
      priority: 4,
      matcher: (context) => 
        context.operation === 'bulk-operation' && 
        context.organizationId !== undefined,
      limits: {
        requests: 100,
        windowMs: 300000, // 5 minutes
        burst: 20,
      },
      actions: {
        onLimit: async (context) => {
          logger.warn('Organization bulk operations rate limit exceeded', { 
            organizationId: context.organizationId,
            context 
          });
        },
      },
    });

    // User-specific limits
    this.addRule({
      id: 'user-actions',
      name: 'User Actions',
      description: 'Rate limit for user actions',
      priority: 5,
      matcher: (context) => 
        context.operation === 'user-action' && 
        context.userId !== undefined,
      limits: {
        requests: 1000,
        windowMs: 60000, // 1 minute
        burst: 50,
      },
      actions: {},
    });

    // Database operations
    this.addRule({
      id: 'database-operations',
      name: 'Database Operations',
      description: 'Rate limit for database operations',
      priority: 6,
      matcher: (context) => context.operation.startsWith('db-'),
      limits: {
        requests: 5000,
        windowMs: 60000, // 1 minute
        burst: 200,
      },
      actions: {},
    });

    logger.info('Rate limiting rules initialized', { rulesCount: this.rules.size });
  }

  /**
   * Add a rate limiting rule
   */
  addRule(rule: RateLimitRule): void {
    this.rules.set(rule.id, rule);
    this.metrics.ruleHits[rule.id] = 0;
    logger.info('Rate limiting rule added', { ruleId: rule.id, name: rule.name });
  }

  /**
   * Remove a rate limiting rule
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      delete this.metrics.ruleHits[ruleId];
      logger.info('Rate limiting rule removed', { ruleId });
    }
    return removed;
  }

  /**
   * Check if request is allowed based on rate limits
   */
  async checkLimit(context: RateLimitContext): Promise<RateLimitResult> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Find matching rule with highest priority
      const matchingRule = this.findMatchingRule(context);
      
      if (!matchingRule) {
        // No matching rule, use default limits
        const result = await this.checkDefaultLimit(context);
        this.updateMetrics(startTime, result);
        return result;
      }

      // Check circuit breaker
      if (this.config.circuitBreaker.enabled) {
        const circuitBreakerResult = this.checkCircuitBreaker(context.key);
        if (!circuitBreakerResult.allowed) {
          this.metrics.blockedRequests++;
          this.updateMetrics(startTime, circuitBreakerResult);
          return circuitBreakerResult;
        }
      }

      // Apply rate limiting
      const result = await this.applyRateLimit(context, matchingRule);
      
      // Track rule hits
      this.metrics.ruleHits[matchingRule.id]++;
      
      // Update circuit breaker state
      if (this.config.circuitBreaker.enabled) {
        this.updateCircuitBreaker(context.key, result.allowed);
      }
      
      // Apply adaptive scaling
      if (this.config.adaptiveScaling.enabled) {
        await this.applyAdaptiveScaling(context, result);
      }

      this.updateMetrics(startTime, result);
      return result;

    } catch (error) {
      logger.error('Rate limit check failed', error as Error, { context });
      this.metrics.blockedRequests++;
      
      // Fail open by default
      const result: RateLimitResult = {
        allowed: true,
        remaining: 0,
        resetTime: Date.now() + 60000,
        metadata: { error: 'rate_limit_check_failed' },
      };
      
      this.updateMetrics(startTime, result);
      return result;
    }
  }

  /**
   * Bulk check rate limits for multiple contexts
   */
  async checkBulkLimits(contexts: RateLimitContext[]): Promise<RateLimitResult[]> {
    const results: RateLimitResult[] = [];
    
    // Process in batches to avoid overwhelming Redis
    const batchSize = 100;
    for (let i = 0; i < contexts.length; i += batchSize) {
      const batch = contexts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(context => this.checkLimit(context))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetLimit(key: string): Promise<boolean> {
    try {
      const keys = await this.redis.keys(`*${key}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info('Rate limit reset', { key, keysDeleted: keys.length });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to reset rate limit', error as Error, { key });
      return false;
    }
  }

  /**
   * Get current rate limit status
   */
  async getStatus(key: string): Promise<{
    current: number;
    limit: number;
    remaining: number;
    resetTime: number;
  } | null> {
    try {
      const redisKey = `${key}:count`;
      const ttlKey = `${key}:ttl`;
      
      const [current, ttl] = await Promise.all([
        this.redis.get(redisKey),
        this.redis.ttl(redisKey),
      ]);

      if (current === null) {
        return null;
      }

      const currentCount = parseInt(current);
      const resetTime = Date.now() + (ttl * 1000);

      // Find matching rule to get limit
      const context: RateLimitContext = {
        key,
        operation: 'status-check',
        timestamp: Date.now(),
      };
      
      const matchingRule = this.findMatchingRule(context);
      const limit = matchingRule?.limits.requests || this.config.defaultLimits.requests;

      return {
        current: currentCount,
        limit,
        remaining: Math.max(0, limit - currentCount),
        resetTime,
      };

    } catch (error) {
      logger.error('Failed to get rate limit status', error as Error, { key });
      return null;
    }
  }

  /**
   * Get rate limiting metrics
   */
  getMetrics(): RateLimitMetrics & {
    blockedPercentage: number;
    allowedPercentage: number;
    circuitBreakerStatus: Record<string, any>;
    activeRules: number;
  } {
    const blockedPercentage = this.metrics.totalRequests > 0
      ? (this.metrics.blockedRequests / this.metrics.totalRequests) * 100
      : 0;

    const allowedPercentage = this.metrics.totalRequests > 0
      ? (this.metrics.allowedRequests / this.metrics.totalRequests) * 100
      : 0;

    const circuitBreakerStatus: Record<string, any> = {};
    this.circuitBreakerState.forEach((state, key) => {
      circuitBreakerStatus[key] = state;
    });

    return {
      ...this.metrics,
      blockedPercentage: Number(blockedPercentage.toFixed(2)),
      allowedPercentage: Number(allowedPercentage.toFixed(2)),
      circuitBreakerStatus,
      activeRules: this.rules.size,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    redis: boolean;
    circuitBreakers: Record<string, string>;
    metrics: any;
  }> {
    try {
      const redisPing = await this.redis.ping();
      const redisHealthy = redisPing === 'PONG';

      const circuitBreakers: Record<string, string> = {};
      this.circuitBreakerState.forEach((state, key) => {
        circuitBreakers[key] = state.state;
      });

      return {
        healthy: redisHealthy,
        redis: redisHealthy,
        circuitBreakers,
        metrics: this.getMetrics(),
      };

    } catch (error) {
      logger.error('Rate limiter health check failed', error as Error);
      return {
        healthy: false,
        redis: false,
        circuitBreakers: {},
        metrics: this.getMetrics(),
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Rate limiter shutdown completed');
    } catch (error) {
      logger.error('Failed to shutdown rate limiter', error as Error);
    }
  }

  // Private helper methods

  private findMatchingRule(context: RateLimitContext): RateLimitRule | null {
    let matchingRule: RateLimitRule | null = null;
    let highestPriority = 0;

    for (const rule of this.rules.values()) {
      if (rule.matcher(context) && rule.priority > highestPriority) {
        matchingRule = rule;
        highestPriority = rule.priority;
      }
    }

    return matchingRule;
  }

  private async checkDefaultLimit(context: RateLimitContext): Promise<RateLimitResult> {
    return this.applyRateLimit(context, {
      id: 'default',
      name: 'Default',
      description: 'Default rate limit',
      priority: 0,
      matcher: () => true,
      limits: this.config.defaultLimits,
      actions: {},
    });
  }

  private async applyRateLimit(
    context: RateLimitContext,
    rule: RateLimitRule
  ): Promise<RateLimitResult> {
    const redisKey = `${context.key}:${rule.id}`;
    const windowMs = rule.limits.windowMs;
    const maxRequests = rule.limits.requests;
    const burst = rule.limits.burst || maxRequests;

    // Use sliding window algorithm
    const now = Date.now();
    const windowStart = now - windowMs;

    // Lua script for atomic sliding window check
    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window_start = tonumber(ARGV[2])
      local max_requests = tonumber(ARGV[3])
      local burst = tonumber(ARGV[4])
      local window_ms = tonumber(ARGV[5])
      
      -- Remove old entries
      redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
      
      -- Get current count
      local current = redis.call('ZCARD', key)
      
      -- Check if request is allowed
      local allowed = false
      if current < max_requests then
        -- Add current request
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
        allowed = true
        current = current + 1
      end
      
      -- Calculate reset time
      local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
      local reset_time = now + window_ms
      if #oldest > 0 then
        reset_time = tonumber(oldest[2]) + window_ms
      end
      
      return {
        allowed and 1 or 0,
        max_requests - current,
        reset_time,
        current
      }
    `;

    try {
      const result = await this.redis.eval(
        luaScript,
        1,
        redisKey,
        now.toString(),
        windowStart.toString(),
        maxRequests.toString(),
        burst.toString(),
        windowMs.toString()
      ) as number[];

      const [allowed, remaining, resetTime, current] = result;

      const rateLimitResult: RateLimitResult = {
        allowed: allowed === 1,
        remaining: Math.max(0, remaining),
        resetTime: resetTime,
        rule,
        metadata: {
          current,
          window: windowMs,
          ruleId: rule.id,
        },
      };

      // Calculate retry after if blocked
      if (!rateLimitResult.allowed) {
        rateLimitResult.retryAfter = Math.max(0, resetTime - now);
        
        // Execute onLimit action
        if (rule.actions.onLimit) {
          await rule.actions.onLimit(context);
        }
      }

      return rateLimitResult;

    } catch (error) {
      logger.error('Rate limit application failed', error as Error, { 
        context, 
        ruleId: rule.id 
      });
      
      // Fail open
      return {
        allowed: true,
        remaining: 0,
        resetTime: now + windowMs,
        rule,
        metadata: { error: 'rate_limit_failed' },
      };
    }
  }

  private checkCircuitBreaker(key: string): RateLimitResult {
    const state = this.circuitBreakerState.get(key);
    
    if (!state) {
      return { allowed: true, remaining: 0, resetTime: Date.now() };
    }

    const now = Date.now();
    
    switch (state.state) {
      case 'open':
        if (now - state.lastFailure > this.config.circuitBreaker.resetTimeoutMs) {
          state.state = 'half-open';
          return { allowed: true, remaining: 0, resetTime: now };
        }
        return {
          allowed: false,
          remaining: 0,
          resetTime: state.lastFailure + this.config.circuitBreaker.resetTimeoutMs,
          retryAfter: this.config.circuitBreaker.resetTimeoutMs - (now - state.lastFailure),
          metadata: { circuitBreakerState: 'open' },
        };
      
      case 'half-open':
        return { allowed: true, remaining: 0, resetTime: now };
      
      default:
        return { allowed: true, remaining: 0, resetTime: now };
    }
  }

  private updateCircuitBreaker(key: string, allowed: boolean): void {
    let state = this.circuitBreakerState.get(key);
    
    if (!state) {
      state = {
        failures: 0,
        lastFailure: 0,
        state: 'closed',
      };
      this.circuitBreakerState.set(key, state);
    }

    if (allowed) {
      if (state.state === 'half-open') {
        state.state = 'closed';
        state.failures = 0;
      }
    } else {
      state.failures++;
      state.lastFailure = Date.now();
      
      if (state.failures >= this.config.circuitBreaker.failureThreshold) {
        state.state = 'open';
        this.metrics.circuitBreakerTrips++;
        logger.warn('Circuit breaker opened', { key, failures: state.failures });
      }
    }
  }

  private async applyAdaptiveScaling(
    context: RateLimitContext,
    result: RateLimitResult
  ): Promise<void> {
    // Adaptive scaling logic would go here
    // For now, we'll just track the events
    this.metrics.adaptiveScalingEvents++;
  }

  private updateMetrics(startTime: number, result: RateLimitResult): void {
    const responseTime = Date.now() - startTime;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime + responseTime) / 2;

    if (result.allowed) {
      this.metrics.allowedRequests++;
    } else {
      this.metrics.blockedRequests++;
    }
  }

  private startMetricsCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);
  }

  private collectMetrics(): void {
    logger.info('Rate limiter metrics collected', this.getMetrics());
  }
}

// Export default configuration
export const createRateLimitConfig = (): RateLimitConfig => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_RATE_LIMIT_DB || '2'),
    keyPrefix: process.env.REDIS_RATE_LIMIT_PREFIX || 'thrive:rate:',
  },
  defaultLimits: {
    requests: parseInt(process.env.RATE_LIMIT_DEFAULT_REQUESTS || '1000'),
    windowMs: parseInt(process.env.RATE_LIMIT_DEFAULT_WINDOW_MS || '60000'),
    burst: parseInt(process.env.RATE_LIMIT_DEFAULT_BURST || '100'),
  },
  adaptiveScaling: {
    enabled: process.env.RATE_LIMIT_ADAPTIVE_SCALING === 'true',
    scaleUpThreshold: parseFloat(process.env.RATE_LIMIT_SCALE_UP_THRESHOLD || '0.8'),
    scaleDownThreshold: parseFloat(process.env.RATE_LIMIT_SCALE_DOWN_THRESHOLD || '0.3'),
    maxScaleFactor: parseFloat(process.env.RATE_LIMIT_MAX_SCALE_FACTOR || '3.0'),
  },
  circuitBreaker: {
    enabled: process.env.RATE_LIMIT_CIRCUIT_BREAKER === 'true',
    failureThreshold: parseInt(process.env.RATE_LIMIT_CIRCUIT_BREAKER_THRESHOLD || '5'),
    resetTimeoutMs: parseInt(process.env.RATE_LIMIT_CIRCUIT_BREAKER_RESET_MS || '60000'),
    monitoringWindowMs: parseInt(process.env.RATE_LIMIT_CIRCUIT_BREAKER_WINDOW_MS || '300000'),
  },
});