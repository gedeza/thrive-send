import { logger } from '@/lib/utils/logger';

export interface EmailTemplate {
  id: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: Record<string, any>;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface SendEmailRequest {
  to: string | string[];
  subject: string;
  content?: string;
  htmlContent?: string;
  textContent?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[];
  metadata?: Record<string, any>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  unsubscribeUrl?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  statusCode?: number;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
  metadata?: Record<string, any>;
}

export interface BulkEmailRequest {
  emails: SendEmailRequest[];
  templateId?: string;
  globalTemplateData?: Record<string, any>;
  batchSize?: number;
}

export interface BulkEmailResponse {
  success: boolean;
  results: SendEmailResponse[];
  totalSent: number;
  totalFailed: number;
  provider: string;
  batchId?: string;
  metadata?: Record<string, any>;
}

export interface EmailProviderConfig {
  apiKey: string;
  baseUrl?: string;
  defaultFrom?: string;
  rateLimits?: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
  retryOptions?: {
    maxAttempts?: number;
    backoffFactor?: number;
    baseDelay?: number;
  };
  timeout?: number;
  webhook?: {
    url: string;
    events: string[];
  };
}

export interface EmailProviderStats {
  totalSent: number;
  totalFailed: number;
  rateLimitHits: number;
  avgResponseTime: number;
  lastUsed: Date;
}

export abstract class BaseEmailProvider {
  protected config: EmailProviderConfig;
  protected stats: EmailProviderStats;
  protected rateLimitState: Map<string, { count: number; resetTime: number }>;

  constructor(config: EmailProviderConfig) {
    this.config = config;
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      rateLimitHits: 0,
      avgResponseTime: 0,
      lastUsed: new Date(),
    };
    this.rateLimitState = new Map();
  }

  abstract get name(): string;
  abstract send(request: SendEmailRequest): Promise<SendEmailResponse>;
  abstract sendBulk?(request: BulkEmailRequest): Promise<BulkEmailResponse>;
  abstract validateTemplate?(templateId: string): Promise<boolean>;
  abstract getDeliveryStatus?(messageId: string): Promise<any>;

  /**
   * Check if we're hitting rate limits
   */
  protected checkRateLimit(limitType: 'second' | 'minute' | 'hour'): boolean {
    const limits = this.config.rateLimits;
    if (!limits) return true;

    const now = Date.now();
    const key = limitType;
    const currentState = this.rateLimitState.get(key) || { count: 0, resetTime: now };

    // Reset counters if time window has passed
    const windowSizes = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
    };

    if (now >= currentState.resetTime) {
      currentState.count = 0;
      currentState.resetTime = now + windowSizes[limitType];
    }

    const maxRequests = {
      second: limits.requestsPerSecond || Infinity,
      minute: limits.requestsPerMinute || Infinity,
      hour: limits.requestsPerHour || Infinity,
    };

    if (currentState.count >= maxRequests[limitType]) {
      this.stats.rateLimitHits++;
      logger.warn(`Rate limit hit for ${this.name}`, {
        limitType,
        currentCount: currentState.count,
        maxRequests: maxRequests[limitType],
        resetTime: currentState.resetTime,
        provider: this.name,
      });
      return false;
    }

    currentState.count++;
    this.rateLimitState.set(key, currentState);
    return true;
  }

  /**
   * Validate email request
   */
  protected validateRequest(request: SendEmailRequest): string[] {
    const errors: string[] = [];

    if (!request.to || (Array.isArray(request.to) && request.to.length === 0)) {
      errors.push('Recipient email address is required');
    }

    if (!request.subject) {
      errors.push('Subject is required');
    }

    if (!request.content && !request.htmlContent && !request.templateId) {
      errors.push('Either content, htmlContent, or templateId is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(request.to) ? request.to : [request.to];
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email format: ${email}`);
      }
    }

    return errors;
  }

  /**
   * Update provider statistics
   */
  protected updateStats(success: boolean, responseTime: number) {
    this.stats.lastUsed = new Date();
    
    if (success) {
      this.stats.totalSent++;
    } else {
      this.stats.totalFailed++;
    }

    // Update average response time
    this.stats.avgResponseTime = (this.stats.avgResponseTime + responseTime) / 2;
  }

  /**
   * Get provider statistics
   */
  getStats(): EmailProviderStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      rateLimitHits: 0,
      avgResponseTime: 0,
      lastUsed: new Date(),
    };
  }

  /**
   * Check provider health
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Send a test email to a test address
      const testResult = await this.send({
        to: 'test@example.com',
        subject: 'Health Check',
        content: 'This is a health check email',
        metadata: { healthCheck: true },
      });

      return testResult.success;
    } catch (error) {
      logger.error(`Health check failed for ${this.name}`, error as Error);
      return false;
    }
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo(): Record<string, { count: number; resetTime: number }> {
    const info: Record<string, { count: number; resetTime: number }> = {};
    
    for (const [key, value] of this.rateLimitState.entries()) {
      info[key] = { ...value };
    }
    
    return info;
  }
}