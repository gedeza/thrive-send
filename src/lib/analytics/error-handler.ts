import { NextResponse } from 'next/server';
import { analyticsCacheManager } from './cache-manager';

/**
 * Analytics Error Handler
 * Comprehensive error handling for analytics APIs with proper logging and recovery
 */

export enum AnalyticsErrorCode {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  QUERY_TIMEOUT = 'QUERY_TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  INVALID_METRIC = 'INVALID_METRIC',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export interface AnalyticsError {
  code: AnalyticsErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  stack?: string;
}

export class AnalyticsErrorHandler {
  /**
   * Create a standardized error response
   */
  static createError(
    code: AnalyticsErrorCode,
    message: string,
    details?: any,
    statusCode: number = 500
  ): NextResponse {
    const error: AnalyticsError = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    // Log error for monitoring
    console.error("", _error);

    return NextResponse.json(
      {
        error: {
          code,
          message,
          timestamp: error.timestamp,
        },
        success: false,
      },
      { status: statusCode }
    );
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(message: string = 'Authentication failed'): NextResponse {
    return this.createError(
      AnalyticsErrorCode.AUTHENTICATION_FAILED,
      message,
      null,
      401
    );
  }

  /**
   * Handle authorization errors
   */
  static handleAuthzError(message: string = 'Insufficient permissions'): NextResponse {
    return this.createError(
      AnalyticsErrorCode.AUTHORIZATION_FAILED,
      message,
      null,
      403
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(message: string, details?: any): NextResponse {
    return this.createError(
      AnalyticsErrorCode.INVALID_REQUEST,
      message,
      details,
      400
    );
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: Error, context?: string): NextResponse {
    const message = `Database error${context ? ` in ${context}` : ''}`;
    
    // Log full error for debugging
    console.error('Database Error:', {
      message: error.message,
      stack: error.stack,
      context,
    });

    return this.createError(
      AnalyticsErrorCode.DATABASE_ERROR,
      message,
      { originalError: error.message },
      500
    );
  }

  /**
   * Handle cache errors
   */
  static handleCacheError(error: Error, operation: string): NextResponse {
    const message = `Cache error during ${operation}`;
    
    console.error('Cache Error:', {
      message: error.message,
      operation,
    });

    return this.createError(
      AnalyticsErrorCode.CACHE_ERROR,
      message,
      { operation, originalError: error.message },
      500
    );
  }

  /**
   * Handle query timeout errors
   */
  static handleTimeoutError(query: string, timeout: number): NextResponse {
    return this.createError(
      AnalyticsErrorCode.QUERY_TIMEOUT,
      `Query timed out after ${timeout}ms`,
      { query, timeout },
      408
    );
  }

  /**
   * Handle rate limiting
   */
  static handleRateLimitError(limit: number, window: number): NextResponse {
    return this.createError(
      AnalyticsErrorCode.RATE_LIMITED,
      `Rate limit exceeded: ${limit} requests per ${window} seconds`,
      { limit, window },
      429
    );
  }

  /**
   * Handle invalid date range errors
   */
  static handleInvalidDateRangeError(startDate?: Date, endDate?: Date): NextResponse {
    return this.createError(
      AnalyticsErrorCode.INVALID_DATE_RANGE,
      'Invalid date range provided',
      { startDate, endDate },
      400
    );
  }

  /**
   * Handle invalid metric errors
   */
  static handleInvalidMetricError(metric: string, validMetrics: string[]): NextResponse {
    return this.createError(
      AnalyticsErrorCode.INVALID_METRIC,
      `Invalid metric '${metric}'. Valid metrics: ${validMetrics.join(', ')}`,
      { metric, validMetrics },
      400
    );
  }

  /**
   * Handle insufficient data errors
   */
  static handleInsufficientDataError(message: string = 'Insufficient data for analysis'): NextResponse {
    return this.createError(
      AnalyticsErrorCode.INSUFFICIENT_DATA,
      message,
      null,
      404
    );
  }

  /**
   * Handle external service errors
   */
  static handleExternalServiceError(service: string, error: Error): NextResponse {
    const message = `External service error: ${service}`;
    
    console.error('External Service Error:', {
      service,
      message: error.message,
    });

    return this.createError(
      AnalyticsErrorCode.EXTERNAL_SERVICE_ERROR,
      message,
      { service, originalError: error.message },
      502
    );
  }

  /**
   * Handle generic internal server errors
   */
  static handleInternalError(error: Error, context?: string): NextResponse {
    const message = `Internal server error${context ? ` in ${context}` : ''}`;
    
    console.error('Internal Server Error:', {
      message: error.message,
      stack: error.stack,
      context,
    });

    return this.createError(
      AnalyticsErrorCode.INTERNAL_SERVER_ERROR,
      message,
      { originalError: error.message },
      500
    );
  }

  /**
   * Generic error handler wrapper
   */
  static async handleError(error: any, context?: string): Promise<NextResponse> {
    // Handle specific error types
    if (error.message === 'Not authenticated') {
      return this.handleAuthError();
    }

    if (error.message === 'User not found') {
      return this.handleAuthError('User not found');
    }

    if (error.message === 'Insufficient permissions') {
      return this.handleAuthzError();
    }

    if (error.name === 'ValidationError') {
      return this.handleValidationError(error.message, error.details);
    }

    if (error.name === 'DatabaseError' || error.code?.startsWith('P')) {
      return this.handleDatabaseError(error, context);
    }

    if (error.name === 'TimeoutError') {
      return this.handleTimeoutError(error.query || 'unknown', error.timeout || 30000);
    }

    // Default to internal server error
    return this.handleInternalError(error, context);
  }
}

/**
 * Request validation utilities
 */
export class AnalyticsRequestValidator {
  /**
   * Validate date range parameters
   */
  static validateDateRange(startDate?: string, endDate?: string): {
    isValid: boolean;
    startDate?: Date;
    endDate?: Date;
    error?: string;
  } {
    if (!startDate || !endDate) {
      return { isValid: true }; // Optional parameters
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        isValid: false,
        error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
      };
    }

    if (start > end) {
      return {
        isValid: false,
        error: 'Start date must be before end date',
      };
    }

    const daysDiff = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return {
        isValid: false,
        error: 'Date range cannot exceed 365 days',
      };
    }

    return {
      isValid: true,
      startDate: start,
      endDate: end,
    };
  }

  /**
   * Validate metric parameter
   */
  static validateMetric(metric: string): {
    isValid: boolean;
    error?: string;
  } {
    const validMetrics = ['views', 'engagement', 'engagements', 'conversions', 'clicks', 'impressions'];
    
    if (!validMetrics.includes(metric)) {
      return {
        isValid: false,
        error: `Invalid metric '${metric}'. Valid metrics: ${validMetrics.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate timeframe parameter
   */
  static validateTimeframe(timeframe: string): {
    isValid: boolean;
    error?: string;
  } {
    const validTimeframes = ['hour', 'day', 'week', 'month'];
    
    if (!validTimeframes.includes(timeframe)) {
      return {
        isValid: false,
        error: `Invalid timeframe '${timeframe}'. Valid timeframes: ${validTimeframes.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validate platform parameter
   */
  static validatePlatform(platform: string): {
    isValid: boolean;
    error?: string;
  } {
    const validPlatforms = ['all', 'facebook', 'instagram', 'twitter', 'linkedin', 'email'];
    
    if (!validPlatforms.includes(platform)) {
      return {
        isValid: false,
        error: `Invalid platform '${platform}'. Valid platforms: ${validPlatforms.join(', ')}`,
      };
    }

    return { isValid: true };
  }
}

/**
 * Middleware for wrapping API handlers with error handling
 */
export function withAnalyticsErrorHandler(
  handler: (request: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: Request, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (_error) {
      return AnalyticsErrorHandler.handleError(error, handler.name);
    }
  };
}

/**
 * Decorator for adding error handling to class methods
 */
export function withErrorHandling(context?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (_error) {
        throw new Error(`Error in ${context || propertyKey}: ${error.message}`);
      }
    };

    return descriptor;
  };
}

/**
 * Circuit breaker for external service calls
 */
export class AnalyticsCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private isOpen = false;
  
  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.isOpen = false;
        this.failureCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.failureCount = 0;
      return result;
    } catch (_error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.threshold) {
        this.isOpen = true;
      }
      
      throw _error;
    }
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.isOpen = false;
  }

  getState(): {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
  } {
    return {
      isOpen: this.isOpen,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Export singleton circuit breaker instance
export const analyticsCircuitBreaker = new AnalyticsCircuitBreaker();