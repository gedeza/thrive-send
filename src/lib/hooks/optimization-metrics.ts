/**
 * Optimization Metrics and Reporting System
 * Comprehensive metrics collection and analysis for code optimization
 */

import { OverallMetrics, OptimizationResult } from './optimization-hook-system';
import { FeedbackMessage } from './realtime-feedback';

export interface MetricsSnapshot {
  timestamp: number;
  filePath: string;
  metrics: OverallMetrics;
  ruleViolations: RuleViolation[];
  processingTime: number;
  codeSize: number;
  complexity: number;
}

export interface RuleViolation {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  category: 'performance' | 'security' | 'maintainability' | 'cost';
  message: string;
  line?: number;
  column?: number;
}

export interface TrendData {
  timestamp: number;
  value: number;
  category: string;
}

export interface OptimizationReport {
  summary: {
    totalFiles: number;
    totalViolations: number;
    averageScore: number;
    processingTime: number;
    timeRange: {
      start: number;
      end: number;
    };
  };
  categories: {
    performance: CategoryMetrics;
    security: CategoryMetrics;
    maintainability: CategoryMetrics;
    cost: CategoryMetrics;
  };
  trends: {
    performance: TrendData[];
    security: TrendData[];
    maintainability: TrendData[];
    cost: TrendData[];
    overallScore: TrendData[];
  };
  topViolations: RuleViolation[];
  recommendations: string[];
  fileAnalysis: FileAnalysis[];
}

export interface CategoryMetrics {
  score: number;
  violations: number;
  trend: 'improving' | 'declining' | 'stable';
  topRules: { ruleId: string; count: number }[];
}

export interface FileAnalysis {
  filePath: string;
  score: number;
  violations: number;
  size: number;
  complexity: number;
  recommendations: string[];
}

export class OptimizationMetricsCollector {
  private static instance: OptimizationMetricsCollector;
  private snapshots: MetricsSnapshot[] = [];
  private feedbackMessages: FeedbackMessage[] = [];
  private startTime: number = Date.now();
  private processingTimes: number[] = [];
  private ruleViolations: Map<string, number> = new Map();

  private constructor() {
    this.setupPeriodicCleanup();
  }

  public static getInstance(): OptimizationMetricsCollector {
    if (!OptimizationMetricsCollector.instance) {
      OptimizationMetricsCollector.instance = new OptimizationMetricsCollector();
    }
    return OptimizationMetricsCollector.instance;
  }

  private setupPeriodicCleanup(): void {
    // Clean up old snapshots every hour
    setInterval(() => {
      this.cleanupOldSnapshots();
    }, 3600000);
  }

  private cleanupOldSnapshots(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    this.snapshots = this.snapshots.filter(snapshot => snapshot.timestamp > cutoff);
  }

  public recordSnapshot(
    filePath: string,
    metrics: OverallMetrics,
    results: OptimizationResult[],
    processingTime: number,
    codeSize: number,
    complexity: number
  ): void {
    const violations = this.extractViolations(results);
    
    const snapshot: MetricsSnapshot = {
      timestamp: Date.now(),
      filePath,
      metrics,
      ruleViolations: violations,
      processingTime,
      codeSize,
      complexity
    };
    
    this.snapshots.push(snapshot);
    this.processingTimes.push(processingTime);
    
    // Record rule violations
    violations.forEach(violation => {
      const key = `${violation.ruleId}:${violation.severity}`;
      this.ruleViolations.set(key, (this.ruleViolations.get(key) || 0) + 1);
    });
    
    // Limit snapshots to prevent memory issues
    if (this.snapshots.length > 10000) {
      this.snapshots.shift();
    }
  }

  private extractViolations(results: OptimizationResult[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    
    results.forEach(result => {
      if (!result.passed) {
        violations.push({
          ruleId: 'unknown', // This would be passed from the rule engine
          severity: result.severity,
          category: this.determineCategory(result.message),
          message: result.message
        });
      }
    });
    
    return violations;
  }

  private determineCategory(message: string): 'performance' | 'security' | 'maintainability' | 'cost' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('performance') || lowerMessage.includes('slow') || lowerMessage.includes('query')) {
      return 'performance';
    }
    if (lowerMessage.includes('security') || lowerMessage.includes('auth') || lowerMessage.includes('validation')) {
      return 'security';
    }
    if (lowerMessage.includes('cost') || lowerMessage.includes('expensive') || lowerMessage.includes('memory')) {
      return 'cost';
    }
    
    return 'maintainability';
  }

  public recordFeedbackMessage(message: FeedbackMessage): void {
    this.feedbackMessages.push(message);
    
    // Limit feedback messages
    if (this.feedbackMessages.length > 5000) {
      this.feedbackMessages.shift();
    }
  }

  public generateReport(timeRange?: { start: number; end: number }): OptimizationReport {
    const filteredSnapshots = this.filterSnapshotsByTime(timeRange);
    
    return {
      summary: this.generateSummary(filteredSnapshots),
      categories: this.generateCategoryMetrics(filteredSnapshots),
      trends: this.generateTrendData(filteredSnapshots),
      topViolations: this.getTopViolations(filteredSnapshots),
      recommendations: this.generateRecommendations(filteredSnapshots),
      fileAnalysis: this.generateFileAnalysis(filteredSnapshots)
    };
  }

  private filterSnapshotsByTime(timeRange?: { start: number; end: number }): MetricsSnapshot[] {
    if (!timeRange) {
      return this.snapshots;
    }
    
    return this.snapshots.filter(snapshot => 
      snapshot.timestamp >= timeRange.start && snapshot.timestamp <= timeRange.end
    );
  }

  private generateSummary(snapshots: MetricsSnapshot[]): OptimizationReport['summary'] {
    const uniqueFiles = new Set(snapshots.map(s => s.filePath));
    const totalViolations = snapshots.reduce((sum, s) => sum + s.ruleViolations.length, 0);
    const averageScore = snapshots.length > 0 
      ? snapshots.reduce((sum, s) => sum + s.metrics.overallScore, 0) / snapshots.length 
      : 0;
    const totalProcessingTime = snapshots.reduce((sum, s) => sum + s.processingTime, 0);
    
    return {
      totalFiles: uniqueFiles.size,
      totalViolations,
      averageScore,
      processingTime: totalProcessingTime,
      timeRange: {
        start: snapshots.length > 0 ? Math.min(...snapshots.map(s => s.timestamp)) : Date.now(),
        end: snapshots.length > 0 ? Math.max(...snapshots.map(s => s.timestamp)) : Date.now()
      }
    };
  }

  private generateCategoryMetrics(snapshots: MetricsSnapshot[]): OptimizationReport['categories'] {
    const categories = ['performance', 'security', 'maintainability', 'cost'] as const;
    const result = {} as OptimizationReport['categories'];
    
    categories.forEach(category => {
      const categorySnapshots = snapshots.filter(s => 
        s.ruleViolations.some(v => v.category === category)
      );
      
      const scores = snapshots.map(s => s.metrics[category]);
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      
      const violations = snapshots.reduce((sum, s) => 
        sum + s.ruleViolations.filter(v => v.category === category).length, 0
      );
      
      const trend = this.calculateTrend(snapshots, category);
      const topRules = this.getTopRulesByCategory(snapshots, category);
      
      result[category] = {
        score: averageScore,
        violations,
        trend,
        topRules
      };
    });
    
    return result;
  }

  private calculateTrend(snapshots: MetricsSnapshot[], category: keyof OverallMetrics): 'improving' | 'declining' | 'stable' {
    if (snapshots.length < 2) return 'stable';
    
    const recentSnapshots = snapshots.slice(-10);
    const olderSnapshots = snapshots.slice(-20, -10);
    
    const recentAvg = recentSnapshots.reduce((sum, s) => sum + s.metrics[category], 0) / recentSnapshots.length;
    const olderAvg = olderSnapshots.length > 0 
      ? olderSnapshots.reduce((sum, s) => sum + s.metrics[category], 0) / olderSnapshots.length 
      : recentAvg;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private getTopRulesByCategory(snapshots: MetricsSnapshot[], category: string): { ruleId: string; count: number }[] {
    const ruleCounts = new Map<string, number>();
    
    snapshots.forEach(snapshot => {
      snapshot.ruleViolations
        .filter(v => v.category === category)
        .forEach(violation => {
          ruleCounts.set(violation.ruleId, (ruleCounts.get(violation.ruleId) || 0) + 1);
        });
    });
    
    return Array.from(ruleCounts.entries())
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private generateTrendData(snapshots: MetricsSnapshot[]): OptimizationReport['trends'] {
    const trends = {
      performance: [] as TrendData[],
      security: [] as TrendData[],
      maintainability: [] as TrendData[],
      cost: [] as TrendData[],
      overallScore: [] as TrendData[]
    };
    
    // Group snapshots by time intervals (e.g., hourly)
    const timeIntervals = this.groupSnapshotsByInterval(snapshots, 3600000); // 1 hour intervals
    
    timeIntervals.forEach(([timestamp, intervalSnapshots]) => {
      const avgMetrics = this.calculateAverageMetrics(intervalSnapshots);
      
      trends.performance.push({ timestamp, value: avgMetrics.performance, category: 'performance' });
      trends.security.push({ timestamp, value: avgMetrics.security, category: 'security' });
      trends.maintainability.push({ timestamp, value: avgMetrics.maintainability, category: 'maintainability' });
      trends.cost.push({ timestamp, value: avgMetrics.cost, category: 'cost' });
      trends.overallScore.push({ timestamp, value: avgMetrics.overallScore, category: 'overall' });
    });
    
    return trends;
  }

  private groupSnapshotsByInterval(snapshots: MetricsSnapshot[], interval: number): [number, MetricsSnapshot[]][] {
    const groups = new Map<number, MetricsSnapshot[]>();
    
    snapshots.forEach(snapshot => {
      const intervalKey = Math.floor(snapshot.timestamp / interval) * interval;
      if (!groups.has(intervalKey)) {
        groups.set(intervalKey, []);
      }
      groups.get(intervalKey)!.push(snapshot);
    });
    
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }

  private calculateAverageMetrics(snapshots: MetricsSnapshot[]): OverallMetrics {
    if (snapshots.length === 0) {
      return { performance: 0, security: 0, maintainability: 0, cost: 0, overallScore: 0 };
    }
    
    const sum = snapshots.reduce((acc, snapshot) => ({
      performance: acc.performance + snapshot.metrics.performance,
      security: acc.security + snapshot.metrics.security,
      maintainability: acc.maintainability + snapshot.metrics.maintainability,
      cost: acc.cost + snapshot.metrics.cost,
      overallScore: acc.overallScore + snapshot.metrics.overallScore
    }), { performance: 0, security: 0, maintainability: 0, cost: 0, overallScore: 0 });
    
    return {
      performance: sum.performance / snapshots.length,
      security: sum.security / snapshots.length,
      maintainability: sum.maintainability / snapshots.length,
      cost: sum.cost / snapshots.length,
      overallScore: sum.overallScore / snapshots.length
    };
  }

  private getTopViolations(snapshots: MetricsSnapshot[]): RuleViolation[] {
    const violationCounts = new Map<string, { violation: RuleViolation; count: number }>();
    
    snapshots.forEach(snapshot => {
      snapshot.ruleViolations.forEach(violation => {
        const key = `${violation.ruleId}:${violation.message}`;
        if (!violationCounts.has(key)) {
          violationCounts.set(key, { violation, count: 0 });
        }
        violationCounts.get(key)!.count++;
      });
    });
    
    return Array.from(violationCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => item.violation);
  }

  private generateRecommendations(snapshots: MetricsSnapshot[]): string[] {
    const recommendations = new Set<string>();
    
    // Analyze most common violations
    const topViolations = this.getTopViolations(snapshots);
    
    topViolations.forEach(violation => {
      switch (violation.category) {
        case 'performance':
          recommendations.add('Optimize database queries and API calls');
          recommendations.add('Implement caching strategies');
          break;
        case 'security':
          recommendations.add('Add input validation and authentication');
          recommendations.add('Review security best practices');
          break;
        case 'maintainability':
          recommendations.add('Reduce code complexity and improve type safety');
          recommendations.add('Extract reusable components and utilities');
          break;
        case 'cost':
          recommendations.add('Optimize resource usage and API calls');
          recommendations.add('Implement efficient data structures');
          break;
      }
    });
    
    // Add general recommendations based on trends
    const categoryMetrics = this.generateCategoryMetrics(snapshots);
    Object.entries(categoryMetrics).forEach(([category, metrics]) => {
      if (metrics.trend === 'declining') {
        recommendations.add(`Focus on improving ${category} metrics`);
      }
    });
    
    return Array.from(recommendations).slice(0, 10);
  }

  private generateFileAnalysis(snapshots: MetricsSnapshot[]): FileAnalysis[] {
    const fileGroups = new Map<string, MetricsSnapshot[]>();
    
    snapshots.forEach(snapshot => {
      if (!fileGroups.has(snapshot.filePath)) {
        fileGroups.set(snapshot.filePath, []);
      }
      fileGroups.get(snapshot.filePath)!.push(snapshot);
    });
    
    const analysis: FileAnalysis[] = [];
    
    fileGroups.forEach((fileSnapshots, filePath) => {
      const latestSnapshot = fileSnapshots[fileSnapshots.length - 1];
      const avgScore = fileSnapshots.reduce((sum, s) => sum + s.metrics.overallScore, 0) / fileSnapshots.length;
      const totalViolations = fileSnapshots.reduce((sum, s) => sum + s.ruleViolations.length, 0);
      
      const recommendations = this.generateFileRecommendations(fileSnapshots);
      
      analysis.push({
        filePath,
        score: avgScore,
        violations: totalViolations,
        size: latestSnapshot.codeSize,
        complexity: latestSnapshot.complexity,
        recommendations
      });
    });
    
    return analysis.sort((a, b) => a.score - b.score).slice(0, 20);
  }

  private generateFileRecommendations(fileSnapshots: MetricsSnapshot[]): string[] {
    const recommendations = new Set<string>();
    const latestSnapshot = fileSnapshots[fileSnapshots.length - 1];
    
    // Analyze violations
    const violationCategories = new Set(
      latestSnapshot.ruleViolations.map(v => v.category)
    );
    
    violationCategories.forEach(category => {
      switch (category) {
        case 'performance':
          recommendations.add('Optimize performance-critical sections');
          break;
        case 'security':
          recommendations.add('Add security validations');
          break;
        case 'maintainability':
          recommendations.add('Simplify complex logic');
          break;
        case 'cost':
          recommendations.add('Reduce resource consumption');
          break;
      }
    });
    
    // Analyze complexity
    if (latestSnapshot.complexity > 10) {
      recommendations.add('Break down complex functions');
    }
    
    // Analyze size
    if (latestSnapshot.codeSize > 1000) {
      recommendations.add('Consider splitting large files');
    }
    
    return Array.from(recommendations).slice(0, 5);
  }

  // Public API methods
  public getSnapshots(): MetricsSnapshot[] {
    return [...this.snapshots];
  }

  public getSnapshotsByFile(filePath: string): MetricsSnapshot[] {
    return this.snapshots.filter(s => s.filePath === filePath);
  }

  public getAverageProcessingTime(): number {
    return this.processingTimes.length > 0 
      ? this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length 
      : 0;
  }

  public getViolationStats(): Record<string, number> {
    return Object.fromEntries(this.ruleViolations);
  }

  public getUptime(): number {
    return Date.now() - this.startTime;
  }

  public reset(): void {
    this.snapshots = [];
    this.feedbackMessages = [];
    this.processingTimes = [];
    this.ruleViolations.clear();
    this.startTime = Date.now();
  }

  public exportData(): any {
    return {
      snapshots: this.snapshots,
      feedbackMessages: this.feedbackMessages,
      processingTimes: this.processingTimes,
      ruleViolations: Object.fromEntries(this.ruleViolations),
      startTime: this.startTime
    };
  }

  public importData(data: any): void {
    this.snapshots = data.snapshots || [];
    this.feedbackMessages = data.feedbackMessages || [];
    this.processingTimes = data.processingTimes || [];
    this.ruleViolations = new Map(Object.entries(data.ruleViolations || {}));
    this.startTime = data.startTime || Date.now();
  }
}

// Export singleton
export const metricsCollector = OptimizationMetricsCollector.getInstance();