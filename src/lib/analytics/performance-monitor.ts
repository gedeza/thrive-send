/**
 * Analytics Query Performance Monitor
 * 
 * Features:
 * - Real-time performance tracking
 * - Query optimization recommendations
 * - Performance bottleneck detection
 * - Automated alerting system
 * - Historical performance analysis
 */

import { performance } from 'perf_hooks';
import { getCacheManager } from './cache-manager';

interface QueryMetrics {
  queryId: string;
  queryType: string;
  executionTime: number;
  dataSize: number;
  recordCount: number;
  cacheHit: boolean;
  timestamp: Date;
  organizationId?: string;
  userId?: string;
  errorOccurred: boolean;
  errorMessage?: string;
  optimizationSuggestions?: string[];
}

interface PerformanceSnapshot {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalQueries: number;
  errorRate: number;
  cacheHitRate: number;
  slowestQueries: QueryMetrics[];
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
  timestamp: Date;
}

interface AlertThresholds {
  maxResponseTime: number; // ms
  maxErrorRate: number; // percentage
  minCacheHitRate: number; // percentage
  maxMemoryUsage: number; // percentage
}

class AnalyticsPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private maxMetricsHistory = 10000;
  private cacheManager = getCacheManager();
  
  // Performance thresholds
  private readonly thresholds: AlertThresholds = {
    maxResponseTime: 2000, // 2 seconds
    maxErrorRate: 5, // 5%
    minCacheHitRate: 70, // 70%
    maxMemoryUsage: 85 // 85%
  };

  // Alert callbacks
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];

  /**
   * Start monitoring a query
   */
  startQuery(queryId: string, queryType: string, organizationId?: string, userId?: string): QueryTracker {
    return new QueryTracker(
      queryId,
      queryType,
      this.recordMetric.bind(this),
      organizationId,
      userId
    );
  }

  /**
   * Record query metrics
   */
  private recordMetric(metric: QueryMetrics): void {
    // Add to metrics array
    this.metrics.push(metric);

    // Maintain memory limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Check for performance issues
    this.checkPerformanceThresholds(metric);

    // Store in cache for dashboard access
    this.cachePerformanceData();

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      this.logPerformanceMetric(metric);
    }
  }

  /**
   * Get current performance snapshot
   */
  getCurrentSnapshot(): PerformanceSnapshot {
    if (this.metrics.length === 0) {
      return this.getDefaultSnapshot();
    }

    const recentMetrics = this.getRecentMetrics(24 * 60 * 60 * 1000); // Last 24 hours
    const responseTimes = recentMetrics.map(m => m.executionTime).sort((a, b) => a - b);
    const errors = recentMetrics.filter(m => m.errorOccurred);
    const cacheHits = recentMetrics.filter(m => m.cacheHit);

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    
    const errorRate = recentMetrics.length > 0 ? (errors.length / recentMetrics.length) * 100 : 0;
    const cacheHitRate = recentMetrics.length > 0 ? (cacheHits.length / recentMetrics.length) * 100 : 0;

    const slowestQueries = recentMetrics
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    const performanceGrade = this.calculatePerformanceGrade(
      averageResponseTime,
      errorRate,
      cacheHitRate
    );

    const recommendations = this.generateRecommendations(
      averageResponseTime,
      errorRate,
      cacheHitRate,
      slowestQueries
    );

    return {
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      totalQueries: recentMetrics.length,
      errorRate: parseFloat(errorRate.toFixed(2)),
      cacheHitRate: parseFloat(cacheHitRate.toFixed(2)),
      slowestQueries,
      performanceGrade,
      recommendations,
      timestamp: new Date()
    };
  }

  /**
   * Get performance history for analytics
   */
  getPerformanceHistory(hours: number = 24): PerformanceSnapshot[] {
    const history: PerformanceSnapshot[] = [];
    const interval = Math.max(1, Math.floor(hours / 24)); // Hourly intervals
    const now = Date.now();
    
    for (let i = hours - 1; i >= 0; i -= interval) {
      const timeSlotStart = now - (i + interval) * 60 * 60 * 1000;
      const timeSlotEnd = now - i * 60 * 60 * 1000;
      
      const timeSlotMetrics = this.metrics.filter(m => 
        m.timestamp.getTime() >= timeSlotStart && 
        m.timestamp.getTime() < timeSlotEnd
      );

      if (timeSlotMetrics.length > 0) {
        history.push(this.calculateSnapshotForMetrics(timeSlotMetrics, new Date(timeSlotEnd)));
      }
    }

    return history;
  }

  /**
   * Get query breakdown by type
   */
  getQueryBreakdown(): { [queryType: string]: { count: number; avgTime: number; errorRate: number } } {
    const recentMetrics = this.getRecentMetrics(24 * 60 * 60 * 1000);
    const breakdown: { [queryType: string]: { count: number; avgTime: number; errorRate: number } } = {};

    recentMetrics.forEach(metric => {
      if (!breakdown[metric.queryType]) {
        breakdown[metric.queryType] = { count: 0, avgTime: 0, errorRate: 0 };
      }
      
      const current = breakdown[metric.queryType];
      const newCount = current.count + 1;
      const newAvgTime = (current.avgTime * current.count + metric.executionTime) / newCount;
      const newErrorRate = metric.errorOccurred 
        ? (current.errorRate * current.count + 100) / newCount
        : (current.errorRate * current.count) / newCount;

      breakdown[metric.queryType] = {
        count: newCount,
        avgTime: Math.round(newAvgTime),
        errorRate: parseFloat(newErrorRate.toFixed(2))
      };
    });

    return breakdown;
  }

  /**
   * Get organization performance metrics
   */
  getOrganizationMetrics(organizationId: string): PerformanceSnapshot {
    const orgMetrics = this.metrics.filter(m => m.organizationId === organizationId);
    return this.calculateSnapshotForMetrics(orgMetrics, new Date());
  }

  /**
   * Check performance thresholds and trigger alerts
   */
  private checkPerformanceThresholds(metric: QueryMetrics): void {
    const alerts: PerformanceAlert[] = [];

    // Check response time
    if (metric.executionTime > this.thresholds.maxResponseTime) {
      alerts.push({
        type: 'slow_query',
        severity: metric.executionTime > this.thresholds.maxResponseTime * 2 ? 'critical' : 'warning',
        message: `Query ${metric.queryType} took ${metric.executionTime}ms (threshold: ${this.thresholds.maxResponseTime}ms)`,
        metric,
        timestamp: new Date()
      });
    }

    // Check for errors
    if (metric.errorOccurred) {
      alerts.push({
        type: 'query_error',
        severity: 'error',
        message: `Query ${metric.queryType} failed: ${metric.errorMessage}`,
        metric,
        timestamp: new Date()
      });
    }

    // Check recent error rate
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000); // Last 5 minutes
    const recentErrorRate = recentMetrics.length > 0 
      ? (recentMetrics.filter(m => m.errorOccurred).length / recentMetrics.length) * 100 
      : 0;

    if (recentErrorRate > this.thresholds.maxErrorRate && recentMetrics.length >= 10) {
      alerts.push({
        type: 'high_error_rate',
        severity: 'critical',
        message: `Error rate is ${recentErrorRate.toFixed(2)}% (threshold: ${this.thresholds.maxErrorRate}%)`,
        metric,
        timestamp: new Date()
      });
    }

    // Trigger alerts
    alerts.forEach(alert => {
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Alert callback error:', error);
        }
      });
    });
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    avgResponseTime: number,
    errorRate: number,
    cacheHitRate: number,
    slowestQueries: QueryMetrics[]
  ): string[] {
    const recommendations: string[] = [];

    // Response time recommendations
    if (avgResponseTime > 1000) {
      recommendations.push('Consider implementing query result caching');
      recommendations.push('Review database indexes for frequently queried fields');
      
      if (slowestQueries.length > 0) {
        const slowestQueryType = slowestQueries[0].queryType;
        recommendations.push(`Optimize ${slowestQueryType} queries - they are the slowest`);
      }
    }

    // Cache recommendations
    if (cacheHitRate < 60) {
      recommendations.push('Increase cache TTL for frequently accessed data');
      recommendations.push('Implement more aggressive caching strategies');
    }

    // Error rate recommendations
    if (errorRate > 2) {
      recommendations.push('Investigate error patterns and implement retry logic');
      recommendations.push('Add more robust error handling and fallback mechanisms');
    }

    // Data size recommendations
    const largeQueryTypes = slowestQueries
      .filter(q => q.dataSize > 1024 * 1024) // > 1MB
      .map(q => q.queryType)
      .filter((type, index, array) => array.indexOf(type) === index);

    if (largeQueryTypes.length > 0) {
      recommendations.push(`Consider pagination for large datasets: ${largeQueryTypes.join(', ')}`);
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Performance is good! Continue monitoring for optimal results');
    }

    return recommendations;
  }

  /**
   * Calculate performance grade
   */
  private calculatePerformanceGrade(
    avgResponseTime: number,
    errorRate: number,
    cacheHitRate: number
  ): 'A' | 'B' | 'C' | 'D' | 'F' {
    let score = 100;

    // Response time scoring (40% weight)
    if (avgResponseTime > 2000) score -= 40;
    else if (avgResponseTime > 1000) score -= 25;
    else if (avgResponseTime > 500) score -= 10;

    // Error rate scoring (35% weight)
    score -= errorRate * 7; // Each 1% error rate = 7 points off

    // Cache hit rate scoring (25% weight)
    if (cacheHitRate < 50) score -= 25;
    else if (cacheHitRate < 70) score -= 15;
    else if (cacheHitRate < 85) score -= 5;

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Cache performance data for dashboard access
   */
  private async cachePerformanceData(): Promise<void> {
    try {
      const snapshot = this.getCurrentSnapshot();
      await this.cacheManager.set('analytics:performance:current', snapshot, 60); // 1 minute TTL
      
      const breakdown = this.getQueryBreakdown();
      await this.cacheManager.set('analytics:performance:breakdown', breakdown, 300); // 5 minutes TTL
    } catch (error) {
      console.warn('Failed to cache performance data:', error);
    }
  }

  /**
   * Utility methods
   */
  private getRecentMetrics(milliseconds: number): QueryMetrics[] {
    const cutoff = Date.now() - milliseconds;
    return this.metrics.filter(m => m.timestamp.getTime() >= cutoff);
  }

  private calculateSnapshotForMetrics(metrics: QueryMetrics[], timestamp: Date): PerformanceSnapshot {
    if (metrics.length === 0) {
      return this.getDefaultSnapshot(timestamp);
    }

    const responseTimes = metrics.map(m => m.executionTime).sort((a, b) => a - b);
    const errors = metrics.filter(m => m.errorOccurred);
    const cacheHits = metrics.filter(m => m.cacheHit);

    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    const errorRate = (errors.length / metrics.length) * 100;
    const cacheHitRate = (cacheHits.length / metrics.length) * 100;

    const slowestQueries = metrics
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 5);

    return {
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      totalQueries: metrics.length,
      errorRate: parseFloat(errorRate.toFixed(2)),
      cacheHitRate: parseFloat(cacheHitRate.toFixed(2)),
      slowestQueries,
      performanceGrade: this.calculatePerformanceGrade(averageResponseTime, errorRate, cacheHitRate),
      recommendations: this.generateRecommendations(averageResponseTime, errorRate, cacheHitRate, slowestQueries),
      timestamp
    };
  }

  private getDefaultSnapshot(timestamp = new Date()): PerformanceSnapshot {
    return {
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      totalQueries: 0,
      errorRate: 0,
      cacheHitRate: 0,
      slowestQueries: [],
      performanceGrade: 'A',
      recommendations: ['No queries recorded yet'],
      timestamp
    };
  }

  private logPerformanceMetric(metric: QueryMetrics): void {
    const emoji = metric.errorOccurred ? '❌' : 
                  metric.executionTime > 2000 ? '🐌' :
                  metric.executionTime > 500 ? '⚠️' : '✅';
    
    console.log(`${emoji} Analytics Query [${metric.queryType}] - ${metric.executionTime}ms ${metric.cacheHit ? '(cached)' : '(db)'}`);
    
    if (metric.optimizationSuggestions?.length) {
      console.log('💡 Optimization suggestions:', metric.optimizationSuggestions);
    }
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Clear metrics history
   */
  clearHistory(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }
}

/**
 * Query tracker for individual queries
 */
class QueryTracker {
  private startTime: number;
  private dataSize = 0;
  private recordCount = 0;

  constructor(
    private queryId: string,
    private queryType: string,
    private recordMetric: (metric: QueryMetrics) => void,
    private organizationId?: string,
    private userId?: string
  ) {
    this.startTime = performance.now();
  }

  /**
   * Set data metrics
   */
  setDataMetrics(dataSize: number, recordCount: number): void {
    this.dataSize = dataSize;
    this.recordCount = recordCount;
  }

  /**
   * Complete query tracking with success
   */
  complete(cacheHit = false): void {
    const executionTime = Math.round(performance.now() - this.startTime);
    
    const optimizationSuggestions = this.generateOptimizationSuggestions(executionTime);

    const metric: QueryMetrics = {
      queryId: this.queryId,
      queryType: this.queryType,
      executionTime,
      dataSize: this.dataSize,
      recordCount: this.recordCount,
      cacheHit,
      timestamp: new Date(),
      organizationId: this.organizationId,
      userId: this.userId,
      errorOccurred: false,
      optimizationSuggestions
    };

    this.recordMetric(metric);
  }

  /**
   * Complete query tracking with error
   */
  error(errorMessage: string): void {
    const executionTime = Math.round(performance.now() - this.startTime);

    const metric: QueryMetrics = {
      queryId: this.queryId,
      queryType: this.queryType,
      executionTime,
      dataSize: this.dataSize,
      recordCount: this.recordCount,
      cacheHit: false,
      timestamp: new Date(),
      organizationId: this.organizationId,
      userId: this.userId,
      errorOccurred: true,
      errorMessage
    };

    this.recordMetric(metric);
  }

  /**
   * Generate optimization suggestions based on performance
   */
  private generateOptimizationSuggestions(executionTime: number): string[] {
    const suggestions: string[] = [];

    if (executionTime > 2000) {
      suggestions.push('Consider adding database indexes');
      suggestions.push('Implement query result caching');
    }

    if (this.dataSize > 1024 * 1024) { // > 1MB
      suggestions.push('Consider implementing pagination');
      suggestions.push('Use field selection to reduce data size');
    }

    if (this.recordCount > 1000) {
      suggestions.push('Limit result set size');
      suggestions.push('Consider implementing lazy loading');
    }

    return suggestions;
  }
}

/**
 * Performance alert interface
 */
interface PerformanceAlert {
  type: 'slow_query' | 'query_error' | 'high_error_rate' | 'memory_usage';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metric: QueryMetrics;
  timestamp: Date;
}

// Singleton instance
let monitorInstance: AnalyticsPerformanceMonitor | null = null;

export function getPerformanceMonitor(): AnalyticsPerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new AnalyticsPerformanceMonitor();
  }
  return monitorInstance;
}

// Export types and classes
export type {
  QueryMetrics,
  PerformanceSnapshot,
  PerformanceAlert,
  AlertThresholds
};

export { QueryTracker };