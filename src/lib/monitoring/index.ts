/**
 * Monitoring service for database and application health
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: Record<string, {
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    responseTime?: number;
  }>;
}

export interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

class MonitoringService {
  private startTime = Date.now();
  
  async getHealthStatus(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = {};
    
    // Database health check
    try {
      const dbStart = Date.now();
      // Simple check - would connect to actual DB in production
      await new Promise(resolve => setTimeout(resolve, 10));
      checks.database = {
        status: 'pass',
        responseTime: Date.now() - dbStart
      };
    } catch (_error) {
      checks.database = {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Database connection failed'
      };
    }
    
    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = memUsage.heapUsed / 1024 / 1024;
    checks.memory = {
      status: memUsageMB < 500 ? 'pass' : memUsageMB < 1000 ? 'warn' : 'fail',
      message: `${Math.round(memUsageMB)}MB heap used`
    };
    
    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    const status = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';
    
    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks
    };
  }
  
  recordMetric(metric: MetricData): void {
    // In production, this would send metrics to monitoring service
    console.log('Metric recorded:', metric);
  }
  
  recordError(error: Error, context?: Record<string, any>): void {
    // In production, this would send to error tracking service
    console.error('Error recorded:', error, context);
  }
}

export const monitoring = new MonitoringService();
export default monitoring;