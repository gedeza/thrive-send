import { EmailServiceFactory, EmailServiceConfig, EmailProviderType } from './email-service-factory';
import { BaseEmailProvider, SendEmailRequest, SendEmailResponse, BulkEmailRequest, BulkEmailResponse } from './email-providers/base-email-provider';
import { logger } from '@/lib/utils/logger';

export class EnhancedEmailService {
  private factory: EmailServiceFactory;
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.config = config;
    this.factory = EmailServiceFactory.getInstance(config);
  }

  /**
   * Send a single email with automatic failover
   */
  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      logger.info('Sending email with enhanced service', {
        to: Array.isArray(request.to) ? request.to.length : 1,
        subject: request.subject,
        provider: this.config.primary,
        hasTemplate: !!request.templateId,
      });

      return await this.factory.sendWithFailover(async (provider) => {
        return await provider.send(request);
      });

    } catch (error) {
      logger.error('Enhanced email sending failed', error as Error, {
        to: request.to,
        subject: request.subject,
      });
      
      return {
        success: false,
        provider: 'enhanced-service',
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  /**
   * Send bulk emails with automatic load balancing and failover
   */
  async sendBulkEmails(request: BulkEmailRequest): Promise<BulkEmailResponse> {
    try {
      logger.info('Sending bulk emails with enhanced service', {
        emailCount: request.emails.length,
        batchSize: request.batchSize,
        provider: this.config.primary,
        hasTemplate: !!request.templateId,
      });

      return await this.factory.sendWithFailover(async (provider) => {
        // Check if provider supports bulk sending
        if (provider.sendBulk) {
          return await provider.sendBulk(request);
        } else {
          // Fall back to individual sends
          return await this.sendBulkIndividually(provider, request);
        }
      });

    } catch (error) {
      logger.error('Enhanced bulk email sending failed', error as Error, {
        emailCount: request.emails.length,
      });
      
      return {
        success: false,
        results: [],
        totalSent: 0,
        totalFailed: request.emails.length,
        provider: 'enhanced-service',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Send bulk emails individually when provider doesn't support bulk
   */
  private async sendBulkIndividually(
    provider: BaseEmailProvider,
    request: BulkEmailRequest
  ): Promise<BulkEmailResponse> {
    const startTime = Date.now();
    const results: SendEmailResponse[] = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Process emails in batches
    const batchSize = request.batchSize || 10;
    const batches = [];
    
    for (let i = 0; i < request.emails.length; i += batchSize) {
      batches.push(request.emails.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      // Process batch in parallel
      const batchPromises = batch.map(async (email) => {
        const emailRequest: SendEmailRequest = {
          ...email,
          templateData: {
            ...request.globalTemplateData,
            ...email.templateData,
          },
        };

        if (request.templateId && !email.templateId) {
          emailRequest.templateId = request.templateId;
        }

        return await provider.send(emailRequest);
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            totalSent++;
          } else {
            totalFailed++;
          }
        } else {
          results.push({
            success: false,
            provider: provider.name,
            error: result.reason?.message || 'Unknown error',
            statusCode: 500,
          });
          totalFailed++;
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const totalTime = Date.now() - startTime;

    return {
      success: totalSent > 0,
      results,
      totalSent,
      totalFailed,
      provider: provider.name,
      batchId: `individual-bulk-${Date.now()}`,
      metadata: {
        totalTime,
        batches: batches.length,
        method: 'individual-sends',
      },
    };
  }

  /**
   * Send email with specific provider
   */
  async sendWithProvider(
    request: SendEmailRequest,
    providerType: EmailProviderType
  ): Promise<SendEmailResponse> {
    try {
      const provider = this.factory.getProvider(providerType);
      return await provider.send(request);
    } catch (error) {
      logger.error(`Email sending failed with ${providerType}`, error as Error, {
        to: request.to,
        subject: request.subject,
        provider: providerType,
      });
      
      return {
        success: false,
        provider: providerType,
        error: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      };
    }
  }

  /**
   * Get all provider statistics
   */
  getProviderStats(): Record<string, any> {
    return this.factory.getProviderStats();
  }

  /**
   * Get provider health status
   */
  getHealthStatus(): Record<EmailProviderType, boolean> {
    return this.factory.getHealthStatus();
  }

  /**
   * Test email sending capabilities
   */
  async testEmailSending(testRecipient: string): Promise<Record<string, SendEmailResponse>> {
    const results: Record<string, SendEmailResponse> = {};

    const testRequest: SendEmailRequest = {
      to: testRecipient,
      subject: 'Email Service Test',
      content: 'This is a test email to verify email service functionality.',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    };

    // Test all available providers
    const healthStatus = this.getHealthStatus();
    
    for (const [providerType, isHealthy] of Object.entries(healthStatus)) {
      if (isHealthy) {
        try {
          const result = await this.sendWithProvider(testRequest, providerType as EmailProviderType);
          results[providerType] = result;
        } catch (error) {
          results[providerType] = {
            success: false,
            provider: providerType,
            error: error instanceof Error ? error.message : 'Unknown error',
            statusCode: 500,
          };
        }
      } else {
        results[providerType] = {
          success: false,
          provider: providerType,
          error: 'Provider marked as unhealthy',
          statusCode: 503,
        };
      }
    }

    return results;
  }

  /**
   * Validate email template across providers
   */
  async validateTemplate(templateId: string): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [providerType, provider] of this.factory['providers'].entries()) {
      if (provider.validateTemplate) {
        try {
          results[providerType] = await provider.validateTemplate(templateId);
        } catch (error) {
          logger.error(`Template validation failed for ${providerType}`, error as Error, {
            templateId,
            provider: providerType,
          });
          results[providerType] = false;
        }
      } else {
        results[providerType] = true; // Assume valid if no validation method
      }
    }

    return results;
  }

  /**
   * Get email delivery status
   */
  async getDeliveryStatus(
    messageId: string,
    providerType: EmailProviderType
  ): Promise<any> {
    try {
      const provider = this.factory.getProvider(providerType);
      
      if (provider.getDeliveryStatus) {
        return await provider.getDeliveryStatus(messageId);
      }
      
      return {
        messageId,
        status: 'unknown',
        provider: providerType,
        note: 'Delivery status not supported by this provider',
      };

    } catch (error) {
      logger.error('Failed to get delivery status', error as Error, {
        messageId,
        provider: providerType,
      });
      
      return {
        messageId,
        status: 'error',
        provider: providerType,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<EmailServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.factory.updateConfig(newConfig);
  }

  /**
   * Reset provider statistics
   */
  async resetStats(providerType?: EmailProviderType): Promise<void> {
    await this.factory.resetProviderStats(providerType);
  }

  /**
   * Get service configuration
   */
  getConfig(): EmailServiceConfig {
    return { ...this.config };
  }
}