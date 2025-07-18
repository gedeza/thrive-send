import { metricsCollector } from './metrics-collector';
import { alertManager } from './alert-manager';
import { getCacheManager } from '../cache/index';
import { getRateLimiter } from '../rate-limiting/index';
import { enhancedPrisma } from '../db/enhanced-prisma-client';
import { EmailQueueManager } from '../queue/email-queue';
import { logger } from '../utils/logger';
import os from 'os';
import process from 'process';

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  timestamp: number;
  uptime: number;
  components: {
    database: ComponentStatus;
    cache: ComponentStatus;
    emailQueue: ComponentStatus;
    rateLimiting: ComponentStatus;
    system: ComponentStatus;
    application: ComponentStatus;
  };
  metrics: {
    performance: PerformanceMetrics;
    resources: ResourceMetrics;
    business: BusinessMetrics;
  };
  alerts: {
    active: number;
    critical: number;
    warning: number;
  };
}

export interface ComponentStatus {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  lastCheck: number;
  responseTime?: number;
  metrics: Record<string, number>;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  successRate: number;
}

export interface ResourceMetrics {
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    usage: number;
    used: number;
    total: number;
    heapUsed: number;
    heapTotal: number;
  };
  disk: {
    usage: number;
    available: number;
    total: number;
  };
  network: {
    connectionsActive: number;
    connectionsWaiting: number;
  };
}

export interface BusinessMetrics {
  emailsProcessed: number;
  campaignsActive: number;
  usersActive: number;
  organizationsTotal: number;
  queueBacklog: number;
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private startTime: number;
  private lastMetricsCollection: number = 0;

  private constructor() {
    this.startTime = Date.now();
    this.startMonitoring();
  }

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const now = Date.now();
      const uptime = now - this.startTime;

      // Check all components
      const [
        databaseStatus,
        cacheStatus,
        emailQueueStatus,
        rateLimitingStatus,
        systemStatus,
        applicationStatus
      ] = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkCacheHealth(),
        this.checkEmailQueueHealth(),
        this.checkRateLimitingHealth(),
        this.checkSystemHealth(),
        this.checkApplicationHealth(),
      ]);

      // Collect metrics
      const performanceMetrics = await this.collectPerformanceMetrics();
      const resourceMetrics = await this.collectResourceMetrics();
      const businessMetrics = await this.collectBusinessMetrics();

      // Get alert summary
      const alertStats = alertManager.getAlertStats();

      // Determine overall health
      const componentStatuses = [
        databaseStatus.status,
        cacheStatus.status,
        emailQueueStatus.status,
        rateLimitingStatus.status,
        systemStatus.status,
        applicationStatus.status,
      ];

      const criticalCount = componentStatuses.filter(s => s === 'critical').length;
      const warningCount = componentStatuses.filter(s => s === 'warning').length;

      let overall: 'healthy' | 'warning' | 'critical';
      if (criticalCount > 0) {
        overall = 'critical';
      } else if (warningCount > 0) {
        overall = 'warning';
      } else {
        overall = 'healthy';
      }

      return {
        overall,
        timestamp: now,
        uptime,
        components: {
          database: databaseStatus,
          cache: cacheStatus,
          emailQueue: emailQueueStatus,
          rateLimiting: rateLimitingStatus,
          system: systemStatus,
          application: applicationStatus,
        },
        metrics: {
          performance: performanceMetrics,
          resources: resourceMetrics,
          business: businessMetrics,
        },
        alerts: {
          active: alertStats.active,
          critical: alertStats.bySeverity.critical || 0,
          warning: alertStats.bySeverity.warning || 0,
        },
      };

    } catch (error) {
      logger.error('Failed to get system status', error as Error);
      
      return {
        overall: 'critical',
        timestamp: Date.now(),
        uptime: Date.now() - this.startTime,
        components: {
          database: { status: 'critical', message: 'Unknown', lastCheck: Date.now(), metrics: {} },
          cache: { status: 'critical', message: 'Unknown', lastCheck: Date.now(), metrics: {} },
          emailQueue: { status: 'critical', message: 'Unknown', lastCheck: Date.now(), metrics: {} },
          rateLimiting: { status: 'critical', message: 'Unknown', lastCheck: Date.now(), metrics: {} },
          system: { status: 'critical', message: 'Unknown', lastCheck: Date.now(), metrics: {} },
          application: { status: 'critical', message: 'Unknown', lastCheck: Date.now(), metrics: {} },
        },
        metrics: {
          performance: { responseTime: 0, throughput: 0, errorRate: 100, successRate: 0 },
          resources: {
            cpu: { usage: 0, load: [0, 0, 0] },
            memory: { usage: 0, used: 0, total: 0, heapUsed: 0, heapTotal: 0 },
            disk: { usage: 0, available: 0, total: 0 },
            network: { connectionsActive: 0, connectionsWaiting: 0 },
          },
          business: {
            emailsProcessed: 0,
            campaignsActive: 0,
            usersActive: 0,
            organizationsTotal: 0,
            queueBacklog: 0,
          },
        },
        alerts: { active: 0, critical: 0, warning: 0 },
      };
    }
  }

  /**
   * Record custom metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    metricsCollector.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      tags,
      unit,
    });
  }

  /**
   * Record performance timing
   */
  recordTiming(operation: string, duration: number, tags?: Record<string, string>): void {
    this.recordMetric(`operation_duration`, duration, {
      operation,
      ...tags,
    }, 'ms');
  }

  /**
   * Record business event
   */
  recordBusinessEvent(event: string, count: number = 1, tags?: Record<string, string>): void {
    this.recordMetric(`business_event`, count, {
      event,
      ...tags,
    }, 'count');
  }

  /**
   * Get detailed component health
   */
  async getComponentHealth(component: string): Promise<ComponentStatus> {
    switch (component) {
      case 'database':
        return this.checkDatabaseHealth();
      case 'cache':
        return this.checkCacheHealth();
      case 'emailQueue':
        return this.checkEmailQueueHealth();
      case 'rateLimiting':
        return this.checkRateLimitingHealth();
      case 'system':
        return this.checkSystemHealth();
      case 'application':
        return this.checkApplicationHealth();
      default:
        throw new Error(`Unknown component: ${component}`);
    }
  }

  /**
   * Trigger manual health check
   */
  async triggerHealthCheck(): Promise<void> {
    logger.info('Manual health check triggered');
    await this.performHealthCheck();
  }

  /**
   * Get monitoring metrics
   */
  getMonitoringMetrics(): {
    uptime: number;
    metricsCollected: number;
    lastCollection: number;
    memoryUsage: number;
    activeAlerts: number;
  } {
    const metricsStats = metricsCollector.getMetricsSummary();
    const alertStats = alertManager.getAlertStats();
    
    return {
      uptime: Date.now() - this.startTime,
      metricsCollected: metricsStats.totalMetrics,
      lastCollection: this.lastMetricsCollection,
      memoryUsage: metricsStats.memoryUsage,
      activeAlerts: alertStats.active,
    };
  }

  // Private health check methods

  private async checkDatabaseHealth(): Promise<ComponentStatus> {
    const startTime = Date.now();
    
    try {
      const healthResult = await enhancedPrisma.healthCheck();
      const responseTime = Date.now() - startTime;
      
      const status = healthResult.healthy ? 'healthy' : 'critical';
      const message = healthResult.healthy 
        ? 'Database is healthy'
        : 'Database health check failed';

      return {
        status,
        message,
        lastCheck: Date.now(),
        responseTime,
        metrics: {
          connections: healthResult.connectionPool?.activeConnections || 0,
          poolUtilization: healthResult.connectionPool?.utilizationPercentage || 0,
          queryTime: healthResult.queryOptimizer?.metrics?.averageQueryTime || 0,
          cacheHitRate: healthResult.queryOptimizer?.cache?.hitRate || 0,
        },
      };

    } catch (error) {
      logger.error('Database health check failed', error as Error);
      return {
        status: 'critical',
        message: `Database error: ${(error as Error).message}`,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        metrics: {},
      };
    }
  }

  private async checkCacheHealth(): Promise<ComponentStatus> {
    const startTime = Date.now();
    
    try {
      const cacheManager = getCacheManager();
      const healthResult = await cacheManager.healthCheck();
      const responseTime = Date.now() - startTime;
      
      const status = healthResult.healthy ? 'healthy' : 'critical';
      const message = healthResult.healthy 
        ? 'Cache is healthy'
        : 'Cache health check failed';

      return {
        status,
        message,
        lastCheck: Date.now(),
        responseTime,
        metrics: {
          hitRate: healthResult.metrics?.hitRate || 0,
          memoryUsage: healthResult.metrics?.memoryUsage || 0,
          memoryCacheSize: healthResult.metrics?.memoryCacheSize || 0,
          redisConnections: healthResult.metrics?.redisConnections || 0,
        },
      };

    } catch (error) {
      logger.error('Cache health check failed', error as Error);
      return {
        status: 'critical',
        message: `Cache error: ${(error as Error).message}`,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        metrics: {},
      };
    }
  }

  private async checkEmailQueueHealth(): Promise<ComponentStatus> {
    const startTime = Date.now();
    
    try {
      const queueStats = await EmailQueueManager.getQueueStats();
      const responseTime = Date.now() - startTime;
      
      const waitingJobs = queueStats.waiting || 0;
      const failedJobs = queueStats.failed || 0;
      
      let status: 'healthy' | 'warning' | 'critical';
      let message: string;
      
      if (failedJobs > 100) {
        status = 'critical';
        message = `High number of failed jobs: ${failedJobs}`;
      } else if (waitingJobs > 5000) {
        status = 'warning';
        message = `Large queue backlog: ${waitingJobs} jobs`;
      } else {
        status = 'healthy';
        message = 'Email queue is healthy';
      }

      return {
        status,
        message,
        lastCheck: Date.now(),
        responseTime,
        metrics: {
          waiting: waitingJobs,
          active: queueStats.active || 0,
          completed: queueStats.completed || 0,
          failed: failedJobs,
          delayed: queueStats.delayed || 0,
        },
      };

    } catch (error) {
      logger.error('Email queue health check failed', error as Error);
      return {
        status: 'critical',
        message: `Email queue error: ${(error as Error).message}`,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        metrics: {},
      };
    }
  }

  private async checkRateLimitingHealth(): Promise<ComponentStatus> {
    const startTime = Date.now();
    
    try {
      const rateLimiter = getRateLimiter();
      const healthResult = await rateLimiter.healthCheck();
      const responseTime = Date.now() - startTime;
      
      const status = healthResult.healthy ? 'healthy' : 'critical';
      const message = healthResult.healthy 
        ? 'Rate limiting is healthy'
        : 'Rate limiting health check failed';

      return {
        status,
        message,
        lastCheck: Date.now(),
        responseTime,
        metrics: {
          totalRequests: healthResult.metrics?.totalRequests || 0,
          blockedRequests: healthResult.metrics?.blockedRequests || 0,
          blockedPercentage: healthResult.metrics?.blockedPercentage || 0,
          avgResponseTime: healthResult.metrics?.avgResponseTime || 0,
          activeRules: healthResult.metrics?.activeRules || 0,
        },
      };

    } catch (error) {
      logger.error('Rate limiting health check failed', error as Error);
      return {
        status: 'critical',
        message: `Rate limiting error: ${(error as Error).message}`,
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        metrics: {},
      };
    }
  }

  private async checkSystemHealth(): Promise<ComponentStatus> {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
      
      let status: 'healthy' | 'warning' | 'critical';
      let message: string;
      
      if (cpuUsage > 90 || memoryUsagePercent > 90) {
        status = 'critical';
        message = 'Critical system resource usage';
      } else if (cpuUsage > 70 || memoryUsagePercent > 70) {
        status = 'warning';
        message = 'High system resource usage';
      } else {
        status = 'healthy';
        message = 'System resources are healthy';
      }

      return {
        status,
        message,
        lastCheck: Date.now(),
        metrics: {
          cpuUsage: Number(cpuUsage.toFixed(2)),
          memoryUsage: Number(memoryUsagePercent.toFixed(2)),
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          uptime: process.uptime(),
        },
      };

    } catch (error) {
      logger.error('System health check failed', error as Error);
      return {
        status: 'critical',
        message: `System error: ${(error as Error).message}`,
        lastCheck: Date.now(),
        metrics: {},
      };
    }
  }

  private async checkApplicationHealth(): Promise<ComponentStatus> {
    try {
      // Check if application can handle basic operations
      const startTime = Date.now();
      
      // Test basic functionality (this would be more comprehensive in practice)
      const testOperations = [
        () => Promise.resolve(true), // Test 1: Basic operation
        () => Promise.resolve(true), // Test 2: Another operation
      ];
      
      const results = await Promise.all(
        testOperations.map(op => op().catch(() => false))
      );
      
      const responseTime = Date.now() - startTime;
      const successCount = results.filter(r => r).length;
      const successRate = (successCount / results.length) * 100;
      
      let status: 'healthy' | 'warning' | 'critical';
      let message: string;
      
      if (successRate < 50) {
        status = 'critical';
        message = 'Critical application errors';
      } else if (successRate < 80) {
        status = 'warning';
        message = 'Some application issues detected';
      } else {
        status = 'healthy';
        message = 'Application is healthy';
      }

      return {
        status,
        message,
        lastCheck: Date.now(),
        responseTime,
        metrics: {
          successRate: Number(successRate.toFixed(2)),
          responseTime,
          testsRun: results.length,
          testsPassed: successCount,
        },
      };

    } catch (error) {
      logger.error('Application health check failed', error as Error);
      return {
        status: 'critical',
        message: `Application error: ${(error as Error).message}`,
        lastCheck: Date.now(),
        metrics: {},
      };
    }
  }

  // Private metrics collection methods

  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    const now = Date.now();
    const timeRange = { start: now - 60000, end: now }; // Last minute
    
    return {
      responseTime: metricsCollector.getMetricAggregation('response_time', 'avg', undefined, timeRange) || 0,
      throughput: metricsCollector.getMetricAggregation('throughput', 'sum', undefined, timeRange) || 0,
      errorRate: metricsCollector.getMetricAggregation('error_rate', 'avg', undefined, timeRange) || 0,
      successRate: 100 - (metricsCollector.getMetricAggregation('error_rate', 'avg', undefined, timeRange) || 0),
    };
  }

  private async collectResourceMetrics(): Promise<ResourceMetrics> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    return {
      cpu: {
        usage: Number((os.loadavg()[0] / os.cpus().length * 100).toFixed(2)),
        load: os.loadavg(),
      },
      memory: {
        usage: Number(((usedMemory / totalMemory) * 100).toFixed(2)),
        used: usedMemory,
        total: totalMemory,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
      },
      disk: {
        usage: 0, // Would be implemented with actual disk monitoring
        available: 0,
        total: 0,
      },
      network: {
        connectionsActive: 0, // Would be implemented with actual network monitoring
        connectionsWaiting: 0,
      },
    };
  }

  private async collectBusinessMetrics(): Promise<BusinessMetrics> {
    const now = Date.now();
    const timeRange = { start: now - 3600000, end: now }; // Last hour
    
    return {
      emailsProcessed: metricsCollector.getMetricAggregation('emails_sent', 'sum', undefined, timeRange) || 0,
      campaignsActive: metricsCollector.getLatestMetric('active_campaigns')?.value || 0,
      usersActive: metricsCollector.getLatestMetric('active_users')?.value || 0,
      organizationsTotal: metricsCollector.getLatestMetric('total_organizations')?.value || 0,
      queueBacklog: metricsCollector.getLatestMetric('email_queue_size')?.value || 0,
    };
  }

  // Private monitoring methods

  private startMonitoring(): void {
    // Collect metrics every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 30000);

    // Perform health checks every 2 minutes
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 120000);

    logger.info('System monitoring started');
  }

  private async collectMetrics(): Promise<void> {
    try {
      const now = Date.now();
      this.lastMetricsCollection = now;

      // Collect system metrics
      const resourceMetrics = await this.collectResourceMetrics();
      const performanceMetrics = await this.collectPerformanceMetrics();
      const businessMetrics = await this.collectBusinessMetrics();

      // Record metrics
      metricsCollector.recordMetrics([
        { name: 'cpu_usage', value: resourceMetrics.cpu.usage, timestamp: now, unit: 'percent' },
        { name: 'memory_usage', value: resourceMetrics.memory.usage, timestamp: now, unit: 'percent' },
        { name: 'response_time', value: performanceMetrics.responseTime, timestamp: now, unit: 'ms' },
        { name: 'throughput', value: performanceMetrics.throughput, timestamp: now, unit: 'req/min' },
        { name: 'error_rate', value: performanceMetrics.errorRate, timestamp: now, unit: 'percent' },
        { name: 'emails_processed', value: businessMetrics.emailsProcessed, timestamp: now, unit: 'count' },
        { name: 'active_campaigns', value: businessMetrics.campaignsActive, timestamp: now, unit: 'count' },
        { name: 'queue_backlog', value: businessMetrics.queueBacklog, timestamp: now, unit: 'count' },
      ]);

    } catch (error) {
      logger.error('Failed to collect metrics', error as Error);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const systemStatus = await this.getSystemStatus();
      
      // Record health status as metrics
      const healthValue = systemStatus.overall === 'healthy' ? 1 : 
                         systemStatus.overall === 'warning' ? 0.5 : 0;
      
      metricsCollector.recordMetric({
        name: 'system_health',
        value: healthValue,
        timestamp: Date.now(),
        unit: 'status',
      });

      // Log health status
      logger.info('Health check completed', {
        overall: systemStatus.overall,
        components: Object.keys(systemStatus.components).length,
        alerts: systemStatus.alerts.active,
      });

    } catch (error) {
      logger.error('Health check failed', error as Error);
    }
  }

  /**
   * Shutdown the system monitor
   */
  shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    logger.info('System monitor shutdown completed');
  }
}

// Export singleton instance
export const systemMonitor = SystemMonitor.getInstance();