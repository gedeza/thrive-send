import { BaseEmailProvider, EmailProviderConfig } from './email-providers/base-email-provider';
import { MockEmailProvider } from './email-providers/mock-email-provider';
import { SendGridProvider } from './email-providers/sendgrid-provider';
import { AWSSESProvider, AWSSESConfig } from './email-providers/aws-ses-provider';
import { logger } from '@/lib/utils/logger';

export type EmailProviderType = 'mock' | 'sendgrid' | 'aws-ses' | 'resend';

export interface EmailServiceConfig {
  primary: EmailProviderType;
  fallback?: EmailProviderType;
  providers: {
    mock?: EmailProviderConfig;
    sendgrid?: EmailProviderConfig;
    'aws-ses'?: AWSSESConfig;
    resend?: EmailProviderConfig;
  };
  loadBalancing?: {
    enabled: boolean;
    strategy: 'round-robin' | 'least-used' | 'health-based';
  };
  failover?: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
}

export class EmailServiceFactory {
  private static instance: EmailServiceFactory;
  private providers: Map<EmailProviderType, BaseEmailProvider> = new Map();
  private config: EmailServiceConfig;
  private currentProviderIndex = 0;
  private healthChecks: Map<EmailProviderType, boolean> = new Map();

  private constructor(config: EmailServiceConfig) {
    this.config = config;
    this.initializeProviders();
  }

  static getInstance(config?: EmailServiceConfig): EmailServiceFactory {
    if (!EmailServiceFactory.instance) {
      if (!config) {
        throw new Error('EmailServiceFactory requires config for first initialization');
      }
      EmailServiceFactory.instance = new EmailServiceFactory(config);
    }
    return EmailServiceFactory.instance;
  }

  private initializeProviders(): void {
    logger.info('Initializing email providers', {
      primary: this.config.primary,
      fallback: this.config.fallback,
      providers: Object.keys(this.config.providers),
    });

    // Initialize each configured provider
    for (const [providerType, providerConfig] of Object.entries(this.config.providers)) {
      try {
        let provider: BaseEmailProvider;

        switch (providerType as EmailProviderType) {
          case 'mock':
            provider = new MockEmailProvider(providerConfig);
            break;
          case 'sendgrid':
            if (!providerConfig.apiKey) {
              throw new Error('SendGrid API key is required');
            }
            provider = new SendGridProvider(providerConfig);
            break;
          case 'aws-ses':
            provider = new AWSSESProvider(providerConfig as AWSSESConfig);
            break;
          case 'resend':
            // TODO: Implement Resend provider
            throw new Error('Resend provider not yet implemented');
          default:
            throw new Error(`Unknown provider type: ${providerType}`);
        }

        this.providers.set(providerType as EmailProviderType, provider);
        logger.info(`Initialized ${providerType} provider`, {
          provider: providerType,
        });

      } catch (error) {
        logger.error(`Failed to initialize ${providerType} provider`, error as Error, {
          provider: providerType,
        });
        // Continue with other providers
      }
    }

    // Start health check monitoring
    this.startHealthChecking();
  }

  private async startHealthChecking(): Promise<void> {
    const healthCheckInterval = 5 * 60 * 1000; // 5 minutes

    const runHealthChecks = async () => {
      for (const [providerType, provider] of this.providers.entries()) {
        try {
          const isHealthy = await provider.healthCheck();
          this.healthChecks.set(providerType, isHealthy);
          
          logger.info(`Health check completed for ${providerType}`, {
            provider: providerType,
            healthy: isHealthy,
          });
        } catch (error) {
          this.healthChecks.set(providerType, false);
          logger.error(`Health check failed for ${providerType}`, error as Error, {
            provider: providerType,
          });
        }
      }
    };

    // Run initial health checks
    await runHealthChecks();

    // Set up periodic health checks
    setInterval(runHealthChecks, healthCheckInterval);
  }

  public getProvider(providerType?: EmailProviderType): BaseEmailProvider {
    // If specific provider requested, return it
    if (providerType) {
      const provider = this.providers.get(providerType);
      if (!provider) {
        throw new Error(`Provider ${providerType} not available`);
      }
      return provider;
    }

    // Use load balancing strategy
    if (this.config.loadBalancing?.enabled) {
      return this.getLoadBalancedProvider();
    }

    // Use primary provider
    const primaryProvider = this.providers.get(this.config.primary);
    if (!primaryProvider) {
      throw new Error(`Primary provider ${this.config.primary} not available`);
    }

    return primaryProvider;
  }

  private getLoadBalancedProvider(): BaseEmailProvider {
    const availableProviders = Array.from(this.providers.entries()).filter(
      ([type, provider]) => this.healthChecks.get(type) !== false
    );

    if (availableProviders.length === 0) {
      throw new Error('No healthy email providers available');
    }

    switch (this.config.loadBalancing?.strategy) {
      case 'round-robin':
        const selectedProvider = availableProviders[this.currentProviderIndex % availableProviders.length];
        this.currentProviderIndex++;
        return selectedProvider[1];

      case 'least-used':
        // Find provider with lowest total sent count
        let leastUsedProvider = availableProviders[0];
        let lowestCount = availableProviders[0][1].getStats().totalSent;

        for (const [type, provider] of availableProviders) {
          const stats = provider.getStats();
          if (stats.totalSent < lowestCount) {
            lowestCount = stats.totalSent;
            leastUsedProvider = [type, provider];
          }
        }
        return leastUsedProvider[1];

      case 'health-based':
        // Prefer providers with better health scores
        const healthyProviders = availableProviders.filter(
          ([type, provider]) => this.healthChecks.get(type) === true
        );
        
        if (healthyProviders.length > 0) {
          return healthyProviders[0][1];
        }
        return availableProviders[0][1];

      default:
        return availableProviders[0][1];
    }
  }

  public async sendWithFailover(
    sendFunction: (provider: BaseEmailProvider) => Promise<any>
  ): Promise<any> {
    const maxRetries = this.config.failover?.maxRetries || 3;
    const retryDelay = this.config.failover?.retryDelay || 1000;
    
    let lastError: Error | null = null;
    
    // Try primary provider first
    const providers = [this.config.primary];
    
    // Add fallback if configured
    if (this.config.fallback) {
      providers.push(this.config.fallback);
    }
    
    // Add other healthy providers
    for (const [type, isHealthy] of this.healthChecks.entries()) {
      if (isHealthy && !providers.includes(type)) {
        providers.push(type);
      }
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      for (const providerType of providers) {
        try {
          const provider = this.getProvider(providerType);
          const result = await sendFunction(provider);
          
          // If successful, return result
          if (result.success) {
            if (attempt > 0 || providerType !== this.config.primary) {
              logger.info('Email sent with failover', {
                provider: providerType,
                attempt: attempt + 1,
                fallbackUsed: providerType !== this.config.primary,
              });
            }
            return result;
          }

          lastError = new Error(result.error || 'Unknown error');
          
        } catch (error) {
          lastError = error as Error;
          logger.warn(`Provider ${providerType} failed`, {
            provider: providerType,
            attempt: attempt + 1,
            error: lastError.message,
          });
          
          // Mark provider as unhealthy
          this.healthChecks.set(providerType, false);
        }
      }

      // Wait before retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    // All providers failed
    throw lastError || new Error('All email providers failed');
  }

  public getProviderStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [type, provider] of this.providers.entries()) {
      stats[type] = {
        ...provider.getStats(),
        healthy: this.healthChecks.get(type) || false,
        rateLimits: provider.getRateLimitInfo(),
      };
    }
    
    return stats;
  }

  public getHealthStatus(): Record<EmailProviderType, boolean> {
    const health: Record<string, boolean> = {};
    
    for (const [type, isHealthy] of this.healthChecks.entries()) {
      health[type] = isHealthy;
    }
    
    return health as Record<EmailProviderType, boolean>;
  }

  public async resetProviderStats(providerType?: EmailProviderType): Promise<void> {
    if (providerType) {
      const provider = this.providers.get(providerType);
      if (provider) {
        provider.resetStats();
      }
    } else {
      for (const provider of this.providers.values()) {
        provider.resetStats();
      }
    }
  }

  public updateConfig(newConfig: Partial<EmailServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Email service config updated', {
      primary: this.config.primary,
      fallback: this.config.fallback,
    });
  }
}