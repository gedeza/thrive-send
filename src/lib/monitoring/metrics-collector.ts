import { logger } from '../utils/logger';

export interface MetricPoint {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  unit?: string;
}

export interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration?: number; // milliseconds
  description: string;
}

export interface SystemMetrics {
  // Performance metrics
  responseTime: number;
  throughput: number;
  errorRate: number;
  
  // Resource metrics
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  
  // Database metrics
  dbConnections: number;
  dbQueryTime: number;
  dbPoolUtilization: number;
  
  // Cache metrics
  cacheHitRate: number;
  cacheMemoryUsage: number;
  
  // Email metrics
  emailQueueSize: number;
  emailsSentPerMinute: number;
  emailDeliveryRate: number;
  emailBounceRate: number;
  
  // Rate limiting metrics
  rateLimitHitRate: number;
  blockedRequests: number;
  
  // Business metrics
  activeCampaigns: number;
  activeUsers: number;
  organizationCount: number;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, MetricPoint[]> = new Map();
  private alertThresholds: Map<string, AlertThreshold[]> = new Map();
  private collectionInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: Map<string, (alert: AlertEvent) => Promise<void>> = new Map();
  
  private constructor() {
    this.initializeDefaultThresholds();
    this.startCollection();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Record a metric point
   */
  recordMetric(metric: MetricPoint): void {
    try {
      const key = `${metric.name}${metric.tags ? JSON.stringify(metric.tags) : ''}`;
      
      if (!this.metrics.has(key)) {
        this.metrics.set(key, []);
      }
      
      const points = this.metrics.get(key)!;
      points.push(metric);
      
      // Keep only last 1000 points per metric
      if (points.length > 1000) {
        points.splice(0, points.length - 1000);
      }
      
      // Check alert thresholds
      this.checkThresholds(metric);
      
    } catch (error) {
      logger.error('Failed to record metric', error as Error, { metric });
    }
  }

  /**
   * Record multiple metrics at once
   */
  recordMetrics(metrics: MetricPoint[]): void {
    metrics.forEach(metric => this.recordMetric(metric));
  }

  /**
   * Get metric history
   */
  getMetrics(
    name: string,
    tags?: Record<string, string>,
    timeRange?: { start: number; end: number }
  ): MetricPoint[] {
    const key = `${name}${tags ? JSON.stringify(tags) : ''}`;
    const points = this.metrics.get(key) || [];
    
    if (!timeRange) {
      return points;
    }
    
    return points.filter(point => 
      point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
    );
  }

  /**
   * Get latest metric value
   */
  getLatestMetric(name: string, tags?: Record<string, string>): MetricPoint | null {
    const points = this.getMetrics(name, tags);
    return points.length > 0 ? points[points.length - 1] : null;
  }

  /**
   * Calculate metric aggregations
   */
  getMetricAggregation(
    name: string,
    aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count',
    tags?: Record<string, string>,
    timeRange?: { start: number; end: number }
  ): number {
    const points = this.getMetrics(name, tags, timeRange);
    const values = points.map(p => p.value);
    
    if (values.length === 0) return 0;
    
    switch (aggregation) {
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return 0;
    }
  }

  /**
   * Add alert threshold
   */
  addAlertThreshold(threshold: AlertThreshold): void {
    if (!this.alertThresholds.has(threshold.metric)) {
      this.alertThresholds.set(threshold.metric, []);
    }
    
    this.alertThresholds.get(threshold.metric)!.push(threshold);
    logger.info('Alert threshold added', { threshold });
  }

  /**
   * Remove alert threshold
   */
  removeAlertThreshold(metric: string, severity: string): void {
    const thresholds = this.alertThresholds.get(metric);
    if (thresholds) {
      const filtered = thresholds.filter(t => t.severity !== severity);
      this.alertThresholds.set(metric, filtered);
      logger.info('Alert threshold removed', { metric, severity });
    }
  }

  /**
   * Register alert callback
   */
  onAlert(alertType: string, callback: (alert: AlertEvent) => Promise<void>): void {
    this.alertCallbacks.set(alertType, callback);
  }

  /**
   * Get comprehensive system health
   */
  async getSystemHealth(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    components: Record<string, {
      status: 'healthy' | 'warning' | 'critical';
      metrics: Record<string, number>;
      lastCheck: number;
    }>;
    alerts: AlertEvent[];
  }> {
    try {
      const now = Date.now();
      const timeRange = { start: now - 300000, end: now }; // Last 5 minutes
      
      // Collect system metrics
      const systemMetrics = await this.collectSystemMetrics();
      
      // Evaluate component health
      const components = {
        database: {
          status: this.evaluateHealth(systemMetrics.dbQueryTime, 100, 500) as any,
          metrics: {
            connections: systemMetrics.dbConnections,
            queryTime: systemMetrics.dbQueryTime,
            poolUtilization: systemMetrics.dbPoolUtilization,
          },
          lastCheck: now,
        },
        cache: {
          status: this.evaluateHealth(systemMetrics.cacheHitRate, 80, 60) as any,
          metrics: {
            hitRate: systemMetrics.cacheHitRate,
            memoryUsage: systemMetrics.cacheMemoryUsage,
          },
          lastCheck: now,
        },
        emailQueue: {
          status: this.evaluateHealth(systemMetrics.emailQueueSize, 1000, 5000, true) as any,
          metrics: {
            queueSize: systemMetrics.emailQueueSize,
            emailsPerMinute: systemMetrics.emailsSentPerMinute,
            deliveryRate: systemMetrics.emailDeliveryRate,
            bounceRate: systemMetrics.emailBounceRate,
          },
          lastCheck: now,
        },
        rateLimiting: {
          status: this.evaluateHealth(systemMetrics.rateLimitHitRate, 90, 95) as any,
          metrics: {
            hitRate: systemMetrics.rateLimitHitRate,
            blockedRequests: systemMetrics.blockedRequests,
          },
          lastCheck: now,
        },
        system: {
          status: this.evaluateHealth(systemMetrics.cpuUsage, 80, 95) as any,
          metrics: {
            cpuUsage: systemMetrics.cpuUsage,
            memoryUsage: systemMetrics.memoryUsage,
            diskUsage: systemMetrics.diskUsage,
          },
          lastCheck: now,
        },
      };
      
      // Determine overall health
      const componentStatuses = Object.values(components).map(c => c.status);
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
      
      // Get recent alerts
      const alerts = this.getRecentAlerts(timeRange);
      
      return {
        overall,
        components,
        alerts,
      };
      
    } catch (error) {
      logger.error('Failed to get system health', error as Error);
      return {
        overall: 'critical',
        components: {},
        alerts: [],
      };
    }
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: 'prometheus' | 'json' | 'influxdb'): string {
    const allMetrics: MetricPoint[] = [];
    
    for (const points of this.metrics.values()) {
      allMetrics.push(...points);
    }
    
    switch (format) {
      case 'prometheus':
        return this.formatPrometheus(allMetrics);
      case 'json':
        return JSON.stringify(allMetrics, null, 2);
      case 'influxdb':
        return this.formatInfluxDB(allMetrics);
      default:
        return JSON.stringify(allMetrics, null, 2);
    }
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThan: number): void {
    const cutoff = Date.now() - olderThan;
    
    for (const [key, points] of this.metrics.entries()) {
      const filtered = points.filter(p => p.timestamp > cutoff);
      this.metrics.set(key, filtered);
    }
    
    logger.info('Old metrics cleared', { cutoff, metricsCount: this.metrics.size });
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    totalMetrics: number;
    metricsPerSecond: number;
    memoryUsage: number;
    oldestMetric: number;
    newestMetric: number;
  } {
    let totalPoints = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    
    for (const points of this.metrics.values()) {
      totalPoints += points.length;
      
      if (points.length > 0) {
        oldestTimestamp = Math.min(oldestTimestamp, points[0].timestamp);
        newestTimestamp = Math.max(newestTimestamp, points[points.length - 1].timestamp);
      }
    }
    
    const timeSpan = newestTimestamp - oldestTimestamp;
    const metricsPerSecond = timeSpan > 0 ? (totalPoints / (timeSpan / 1000)) : 0;
    
    return {
      totalMetrics: totalPoints,
      metricsPerSecond: Number(metricsPerSecond.toFixed(2)),
      memoryUsage: this.estimateMemoryUsage(),
      oldestMetric: oldestTimestamp,
      newestMetric: newestTimestamp,
    };
  }

  // Private helper methods

  private initializeDefaultThresholds(): void {
    const defaultThresholds: AlertThreshold[] = [
      // Performance thresholds
      {
        metric: 'response_time',
        operator: 'gt',
        value: 1000,
        severity: 'warning',
        duration: 60000,
        description: 'High response time detected',
      },
      {
        metric: 'response_time',
        operator: 'gt',
        value: 5000,
        severity: 'critical',
        duration: 30000,
        description: 'Critical response time detected',
      },
      {
        metric: 'error_rate',
        operator: 'gt',
        value: 5,
        severity: 'warning',
        duration: 60000,
        description: 'High error rate detected',
      },
      {
        metric: 'error_rate',
        operator: 'gt',
        value: 15,
        severity: 'critical',
        duration: 30000,
        description: 'Critical error rate detected',
      },
      
      // Resource thresholds
      {
        metric: 'cpu_usage',
        operator: 'gt',
        value: 80,
        severity: 'warning',
        duration: 120000,
        description: 'High CPU usage detected',
      },
      {
        metric: 'cpu_usage',
        operator: 'gt',
        value: 95,
        severity: 'critical',
        duration: 60000,
        description: 'Critical CPU usage detected',
      },
      {
        metric: 'memory_usage',
        operator: 'gt',
        value: 85,
        severity: 'warning',
        duration: 120000,
        description: 'High memory usage detected',
      },
      {
        metric: 'memory_usage',
        operator: 'gt',
        value: 95,
        severity: 'critical',
        duration: 60000,
        description: 'Critical memory usage detected',
      },
      
      // Database thresholds
      {
        metric: 'db_connections',
        operator: 'gt',
        value: 25,
        severity: 'warning',
        duration: 60000,
        description: 'High database connection usage',
      },
      {
        metric: 'db_query_time',
        operator: 'gt',
        value: 500,
        severity: 'warning',
        duration: 60000,
        description: 'Slow database queries detected',
      },
      
      // Email thresholds
      {
        metric: 'email_queue_size',
        operator: 'gt',
        value: 1000,
        severity: 'warning',
        duration: 300000,
        description: 'Large email queue detected',
      },
      {
        metric: 'email_bounce_rate',
        operator: 'gt',
        value: 10,
        severity: 'warning',
        duration: 600000,
        description: 'High email bounce rate detected',
      },
      
      // Cache thresholds
      {
        metric: 'cache_hit_rate',
        operator: 'lt',
        value: 70,
        severity: 'warning',
        duration: 300000,
        description: 'Low cache hit rate detected',
      },
    ];
    
    defaultThresholds.forEach(threshold => this.addAlertThreshold(threshold));
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    // This would integrate with actual system monitoring
    // For now, return mock data that would come from real monitoring
    
    const now = Date.now();
    const timeRange = { start: now - 60000, end: now }; // Last minute
    
    return {
      // Performance metrics
      responseTime: this.getMetricAggregation('response_time', 'avg', undefined, timeRange) || 150,
      throughput: this.getMetricAggregation('throughput', 'avg', undefined, timeRange) || 1000,
      errorRate: this.getMetricAggregation('error_rate', 'avg', undefined, timeRange) || 2,
      
      // Resource metrics
      cpuUsage: this.getMetricAggregation('cpu_usage', 'avg', undefined, timeRange) || 45,
      memoryUsage: this.getMetricAggregation('memory_usage', 'avg', undefined, timeRange) || 60,
      diskUsage: this.getMetricAggregation('disk_usage', 'avg', undefined, timeRange) || 35,
      
      // Database metrics
      dbConnections: this.getMetricAggregation('db_connections', 'avg', undefined, timeRange) || 15,
      dbQueryTime: this.getMetricAggregation('db_query_time', 'avg', undefined, timeRange) || 85,
      dbPoolUtilization: this.getMetricAggregation('db_pool_utilization', 'avg', undefined, timeRange) || 50,
      
      // Cache metrics
      cacheHitRate: this.getMetricAggregation('cache_hit_rate', 'avg', undefined, timeRange) || 92,
      cacheMemoryUsage: this.getMetricAggregation('cache_memory_usage', 'avg', undefined, timeRange) || 40,
      
      // Email metrics
      emailQueueSize: this.getMetricAggregation('email_queue_size', 'avg', undefined, timeRange) || 250,
      emailsSentPerMinute: this.getMetricAggregation('emails_sent_per_minute', 'avg', undefined, timeRange) || 500,
      emailDeliveryRate: this.getMetricAggregation('email_delivery_rate', 'avg', undefined, timeRange) || 98.5,
      emailBounceRate: this.getMetricAggregation('email_bounce_rate', 'avg', undefined, timeRange) || 2.1,
      
      // Rate limiting metrics
      rateLimitHitRate: this.getMetricAggregation('rate_limit_hit_rate', 'avg', undefined, timeRange) || 85,
      blockedRequests: this.getMetricAggregation('blocked_requests', 'sum', undefined, timeRange) || 25,
      
      // Business metrics
      activeCampaigns: this.getMetricAggregation('active_campaigns', 'avg', undefined, timeRange) || 150,
      activeUsers: this.getMetricAggregation('active_users', 'avg', undefined, timeRange) || 1250,
      organizationCount: this.getMetricAggregation('organization_count', 'avg', undefined, timeRange) || 85,
    };
  }

  private evaluateHealth(
    value: number, 
    warningThreshold: number, 
    criticalThreshold: number,
    inverse: boolean = false
  ): 'healthy' | 'warning' | 'critical' {
    if (inverse) {
      if (value >= criticalThreshold) return 'critical';
      if (value >= warningThreshold) return 'warning';
      return 'healthy';
    } else {
      if (value <= criticalThreshold) return 'critical';
      if (value <= warningThreshold) return 'warning';
      return 'healthy';
    }
  }

  private checkThresholds(metric: MetricPoint): void {
    const thresholds = this.alertThresholds.get(metric.name) || [];
    
    for (const threshold of thresholds) {
      if (this.evaluateThreshold(metric.value, threshold)) {
        this.triggerAlert({
          id: `${metric.name}_${threshold.severity}_${Date.now()}`,
          metric: metric.name,
          value: metric.value,
          threshold,
          timestamp: metric.timestamp,
          tags: metric.tags,
        });
      }
    }
  }

  private evaluateThreshold(value: number, threshold: AlertThreshold): boolean {
    switch (threshold.operator) {
      case 'gt': return value > threshold.value;
      case 'gte': return value >= threshold.value;
      case 'lt': return value < threshold.value;
      case 'lte': return value <= threshold.value;
      case 'eq': return value === threshold.value;
      default: return false;
    }
  }

  private triggerAlert(alert: AlertEvent): void {
    logger.warn('Alert triggered', { alert });
    
    // Call registered callbacks
    this.alertCallbacks.forEach(async (callback, type) => {
      try {
        await callback(alert);
      } catch (error) {
        logger.error('Alert callback failed', error as Error, { type, alert });
      }
    });
  }

  private getRecentAlerts(timeRange: { start: number; end: number }): AlertEvent[] {
    // This would be implemented with actual alert storage
    // For now, return empty array
    return [];
  }

  private formatPrometheus(metrics: MetricPoint[]): string {
    const lines: string[] = [];
    
    metrics.forEach(metric => {
      const name = metric.name.replace(/[^a-zA-Z0-9_]/g, '_');
      const tags = metric.tags 
        ? Object.entries(metric.tags).map(([k, v]) => `${k}="${v}"`).join(',')
        : '';
      
      const tagString = tags ? `{${tags}}` : '';
      lines.push(`${name}${tagString} ${metric.value} ${metric.timestamp}`);
    });
    
    return lines.join('\n');
  }

  private formatInfluxDB(metrics: MetricPoint[]): string {
    const lines: string[] = [];
    
    metrics.forEach(metric => {
      const tags = metric.tags 
        ? Object.entries(metric.tags).map(([k, v]) => `${k}=${v}`).join(',')
        : '';
      
      const tagString = tags ? `,${tags}` : '';
      lines.push(`${metric.name}${tagString} value=${metric.value} ${metric.timestamp}000000`);
    });
    
    return lines.join('\n');
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const points of this.metrics.values()) {
      totalSize += points.length * 100; // Rough estimate: 100 bytes per metric point
    }
    
    return totalSize;
  }

  private startCollection(): void {
    // Collect metrics every 10 seconds
    this.collectionInterval = setInterval(() => {
      this.collectBasicMetrics();
    }, 10000);
    
    logger.info('Metrics collection started');
  }

  private async collectBasicMetrics(): Promise<void> {
    try {
      const now = Date.now();
      
      // Record timestamp for collection
      this.recordMetric({
        name: 'metrics_collection',
        value: 1,
        timestamp: now,
        unit: 'count',
      });
      
    } catch (error) {
      logger.error('Failed to collect basic metrics', error as Error);
    }
  }

  /**
   * Shutdown the metrics collector
   */
  shutdown(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    logger.info('Metrics collector shutdown completed');
  }
}

export interface AlertEvent {
  id: string;
  metric: string;
  value: number;
  threshold: AlertThreshold;
  timestamp: number;
  tags?: Record<string, string>;
}

// Export singleton instance
export const metricsCollector = MetricsCollector.getInstance();