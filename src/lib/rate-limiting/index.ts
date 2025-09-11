/**
 * Rate Limiting Service for API Protection
 * Provides request rate limiting with Redis-based storage
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  averageResponseTime: number;
  activeKeys: number;
}

// Simple in-memory store for development (replace with Redis in production)
class InMemoryStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly cleanupInterval: number = 60000; // 1 minute

  constructor() {
    // Cleanup expired entries periodically
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (data.resetTime <= now) {
          this.store.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  get(key: string): { count: number; resetTime: number } | null {
    const data = this.store.get(key);
    if (!data) return null;
    
    // Check if expired
    if (data.resetTime <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    
    return data;
  }

  set(key: string, count: number, resetTime: number): void {
    this.store.set(key, { count, resetTime });
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.get(key);
    
    if (existing) {
      existing.count++;
      this.store.set(key, existing);
      return existing;
    } else {
      const newData = { count: 1, resetTime: now + windowMs };
      this.store.set(key, newData);
      return newData;
    }
  }

  getMetrics(): { activeKeys: number } {
    return { activeKeys: this.store.size };
  }

  reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

class RateLimitService {
  private store: InMemoryStore;
  private metrics: {
    totalRequests: number;
    blockedRequests: number;
    allowedRequests: number;
    responseTimes: number[];
  };

  constructor() {
    this.store = new InMemoryStore();
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      allowedRequests: 0,
      responseTimes: [],
    };
  }

  private generateKey(request: Request, keyGenerator?: (request: Request) => string): string {
    if (keyGenerator) {
      return keyGenerator(request);
    }

    // Default key generation based on IP and User-Agent
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'anonymous';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    return `${ip}:${userAgent.substring(0, 50)}`;
  }

  async checkRateLimit(
    request: Request, 
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const key = this.generateKey(request, config.keyGenerator);
      const data = this.store.increment(key, config.windowMs);
      
      const remaining = Math.max(0, config.maxRequests - data.count);
      const success = data.count <= config.maxRequests;

      if (success) {
        this.metrics.allowedRequests++;
      } else {
        this.metrics.blockedRequests++;
      }

      // Track response time
      const responseTime = Date.now() - startTime;
      this.metrics.responseTimes.push(responseTime);
      
      // Keep only last 1000 response times for averaging
      if (this.metrics.responseTimes.length > 1000) {
        this.metrics.responseTimes = this.metrics.responseTimes.slice(-1000);
      }

      return {
        success,
        limit: config.maxRequests,
        remaining,
        resetTime: data.resetTime,
        retryAfter: success ? undefined : Math.ceil((data.resetTime - Date.now()) / 1000),
      };
    } catch (_error) {
      console.error("", _error);
      // On error, allow the request through
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      };
    }
  }

  getMetrics(): RateLimitMetrics {
    const averageResponseTime = this.metrics.responseTimes.length > 0
      ? this.metrics.responseTimes.reduce((sum, time) => sum + time, 0) / this.metrics.responseTimes.length
      : 0;

    const storeMetrics = this.store.getMetrics();

    return {
      totalRequests: this.metrics.totalRequests,
      blockedRequests: this.metrics.blockedRequests,
      allowedRequests: this.metrics.allowedRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      activeKeys: storeMetrics.activeKeys,
    };
  }

  reset(key?: string): void {
    this.store.reset(key);
    
    if (!key) {
      // Reset all metrics
      this.metrics = {
        totalRequests: 0,
        blockedRequests: 0,
        allowedRequests: 0,
        responseTimes: [],
      };
    }
  }

  isHealthy(): boolean {
    try {
      // Basic health check - ensure store is responsive
      const testKey = `health-check-${Date.now()}`;
      this.store.set(testKey, 1, Date.now() + 1000);
      const result = this.store.get(testKey);
      this.store.reset(testKey);
      
      return result !== null;
    } catch (_error) {
      console.error("", _error);
      return false;
    }
  }
}

// Singleton instance
let rateLimitService: RateLimitService | null = null;

export function getRateLimitService(): RateLimitService {
  if (!rateLimitService) {
    rateLimitService = new RateLimitService();
  }
  return rateLimitService;
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // Standard API rate limiting
  API_STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  
  // Strict rate limiting for sensitive endpoints
  API_STRICT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
  },
  
  // Authentication endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // File upload endpoints
  UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  
  // Search endpoints
  SEARCH: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
} as const;

export default getRateLimitService;