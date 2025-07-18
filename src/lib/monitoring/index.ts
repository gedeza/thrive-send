import { metricsCollector } from './metrics-collector';
import { alertManager } from './alert-manager';
import { systemMonitor } from './system-monitor';
import { logger } from '../utils/logger';

// Global monitoring instance
let globalMonitoringSystem: MonitoringSystem | null = null;

/**
 * Initialize the global monitoring system
 */
export function initializeMonitoring(): MonitoringSystem {
  if (!globalMonitoringSystem) {
    globalMonitoringSystem = new MonitoringSystem();
    
    logger.info('Global monitoring system initialized', {
      components: ['metrics', 'alerts', 'system-monitor'],
      startTime: Date.now(),
    });
  }

  return globalMonitoringSystem;
}

/**
 * Get the global monitoring system instance
 */
export function getMonitoringSystem(): MonitoringSystem {
  if (!globalMonitoringSystem) {
    return initializeMonitoring();
  }
  return globalMonitoringSystem;
}

/**
 * High-level monitoring service
 */
export class MonitoringService {
  private monitoring: MonitoringSystem;

  constructor() {
    this.monitoring = getMonitoringSystem();
  }

  /**
   * Record application metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    systemMonitor.recordMetric(name, value, tags, unit);
  }

  /**
   * Record timing metric
   */
  recordTiming(operation: string, duration: number, tags?: Record<string, string>): void {
    systemMonitor.recordTiming(operation, duration, tags);
  }

  /**
   * Record business event
   */
  recordBusinessEvent(event: string, count: number = 1, tags?: Record<string, string>): void {
    systemMonitor.recordBusinessEvent(event, count, tags);
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<any> {
    return systemMonitor.getSystemStatus();
  }

  /**
   * Get component health
   */
  async getComponentHealth(component: string): Promise<any> {
    return systemMonitor.getComponentHealth(component);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(filters?: any): any[] {
    return alertManager.getActiveAlerts(filters);
  }

  /**
   * Get alert statistics
   */
  getAlertStats(timeRange?: any): any {
    return alertManager.getAlertStats(timeRange);
  }

  /**
   * Trigger manual health check
   */
  async triggerHealthCheck(): Promise<void> {
    await systemMonitor.triggerHealthCheck();
  }

  /**
   * Get monitoring dashboard data
   */
  async getDashboardData(): Promise<{
    system: any;
    alerts: any;
    metrics: any;
    performance: any;
  }> {
    const [systemStatus, alertDashboard, monitoringMetrics] = await Promise.all([
      this.getSystemHealth(),
      alertManager.getDashboardData(),
      systemMonitor.getMonitoringMetrics(),
    ]);

    return {
      system: systemStatus,
      alerts: alertDashboard,
      metrics: monitoringMetrics,
      performance: {
        uptime: monitoringMetrics.uptime,
        metricsPerSecond: metricsCollector.getMetricsSummary().metricsPerSecond,
        lastCollection: monitoringMetrics.lastCollection,
      },
    };
  }

  /**
   * Export metrics in various formats
   */
  exportMetrics(format: 'prometheus' | 'json' | 'influxdb' = 'json'): string {
    return metricsCollector.exportMetrics(format);
  }

  /**
   * Health check for monitoring system itself
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    components: Record<string, boolean>;
    uptime: number;
    lastMetricsCollection: number;
  }> {
    try {
      const uptime = systemMonitor.getMonitoringMetrics().uptime;
      const lastCollection = systemMonitor.getMonitoringMetrics().lastCollection;
      
      // Check if metrics collection is working (last collection should be recent)
      const metricsHealthy = Date.now() - lastCollection < 120000; // 2 minutes
      
      return {
        healthy: metricsHealthy,
        components: {
          metricsCollector: metricsHealthy,
          alertManager: true, // Alert manager is always considered healthy if running
          systemMonitor: true, // System monitor is always considered healthy if running
        },
        uptime,
        lastMetricsCollection: lastCollection,
      };

    } catch (error) {
      logger.error('Monitoring system health check failed', error as Error);
      return {
        healthy: false,
        components: {
          metricsCollector: false,
          alertManager: false,
          systemMonitor: false,
        },
        uptime: 0,
        lastMetricsCollection: 0,
      };
    }
  }
}

/**
 * Core monitoring system coordinator
 */
class MonitoringSystem {
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;

    try {
      // Initialize metrics collection
      metricsCollector.recordMetric({
        name: 'monitoring_system_started',
        value: 1,
        timestamp: Date.now(),
        unit: 'count',
      });

      // Setup alert integration
      metricsCollector.onAlert('threshold_exceeded', async (alert) => {
        await alertManager.processAlert(alert);
      });

      // Start system monitoring
      systemMonitor.recordMetric('monitoring_initialized', 1);

      this.initialized = true;
      logger.info('Monitoring system fully initialized');

    } catch (error) {
      logger.error('Failed to initialize monitoring system', error as Error);
      throw error;
    }
  }

  /**
   * Get all monitoring components
   */
  getComponents(): {
    metricsCollector: typeof metricsCollector;
    alertManager: typeof alertManager;
    systemMonitor: typeof systemMonitor;
  } {
    return {
      metricsCollector,
      alertManager,
      systemMonitor,
    };
  }

  /**
   * Shutdown monitoring system
   */
  async shutdown(): Promise<void> {
    try {
      await Promise.all([
        metricsCollector.shutdown(),
        alertManager.shutdown(),
        systemMonitor.shutdown(),
      ]);

      this.initialized = false;
      logger.info('Monitoring system shutdown completed');

    } catch (error) {
      logger.error('Failed to shutdown monitoring system', error as Error);
      throw error;
    }
  }
}

/**
 * Monitoring middleware for performance tracking
 */
export function createMonitoringMiddleware() {
  const monitoring = getMonitoringSystem();
  
  return {
    /**
     * Track API request performance
     */
    trackRequest: (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const originalSend = res.send;
      
      res.send = function(data: any) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        
        // Record request metrics
        systemMonitor.recordTiming('api_request', duration, {
          method: req.method,
          route: req.route?.path || req.path,
          status: statusCode.toString(),
        });
        
        // Record error rate
        systemMonitor.recordMetric('api_request_count', 1, {
          method: req.method,
          status: statusCode.toString(),
        });
        
        if (statusCode >= 400) {
          systemMonitor.recordMetric('api_error_count', 1, {
            method: req.method,
            status: statusCode.toString(),
          });
        }
        
        originalSend.call(this, data);
      };
      
      next();
    },

    /**
     * Track email operations
     */
    trackEmailOperation: (operation: string, recipientCount: number, success: boolean) => {
      systemMonitor.recordBusinessEvent('email_operation', 1, {
        operation,
        success: success.toString(),
      });
      
      systemMonitor.recordMetric('email_recipients', recipientCount, {
        operation,
      });
      
      if (!success) {
        systemMonitor.recordMetric('email_failure_count', 1, {
          operation,
        });
      }
    },

    /**
     * Track database operations
     */
    trackDatabaseOperation: (operation: string, duration: number, success: boolean) => {
      systemMonitor.recordTiming('db_operation', duration, {
        operation,
        success: success.toString(),
      });
      
      if (!success) {
        systemMonitor.recordMetric('db_error_count', 1, {
          operation,
        });
      }
    },

    /**
     * Track cache operations
     */
    trackCacheOperation: (operation: string, hit: boolean, duration?: number) => {
      systemMonitor.recordMetric('cache_operation', 1, {
        operation,
        result: hit ? 'hit' : 'miss',
      });
      
      if (duration !== undefined) {
        systemMonitor.recordTiming('cache_operation', duration, {
          operation,
        });
      }
    },
  };
}

/**
 * Performance decorator for automatic timing
 */
export function performanceTracker(operation: string, tags?: Record<string, string>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        systemMonitor.recordTiming(operation, duration, {
          ...tags,
          success: 'true',
        });
        
        return result;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        systemMonitor.recordTiming(operation, duration, {
          ...tags,
          success: 'false',
        });
        
        systemMonitor.recordMetric('operation_error', 1, {
          operation,
          ...tags,
        });
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Export singleton monitoring service
export const monitoringService = new MonitoringService();

// Export all monitoring classes and functions
export { 
  metricsCollector, 
  alertManager, 
  systemMonitor,
  MonitoringSystem 
};
export type { 
  SystemStatus, 
  ComponentStatus, 
  PerformanceMetrics, 
  ResourceMetrics, 
  BusinessMetrics 
};