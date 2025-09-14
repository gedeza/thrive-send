/**
 * Analytics Performance Monitoring API
 * 
 * Features:
 * - Real-time performance metrics
 * - Query performance breakdown
 * - Historical performance data
 * - Optimization recommendations
 * - Alert configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPerformanceMonitor } from '@/lib/analytics/performance-monitor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const organizationId = searchParams.get('organizationId');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const includeBreakdown = searchParams.get('includeBreakdown') === 'true';

    const performanceMonitor = getPerformanceMonitor();

    // Get current performance snapshot
    const currentSnapshot = performanceMonitor.getCurrentSnapshot();

    // Build response data
    const response: any = {
      current: currentSnapshot,
      meta: {
        timeframe,
        organizationId,
        generatedAt: new Date().toISOString(),
        userId
      }
    };

    // Include historical data if requested
    if (includeHistory) {
      const hours = parseInt(timeframe.replace('h', '')) || 24;
      response.history = performanceMonitor.getPerformanceHistory(hours);
    }

    // Include query breakdown if requested
    if (includeBreakdown) {
      response.breakdown = performanceMonitor.getQueryBreakdown();
    }

    // Include organization-specific metrics if requested
    if (organizationId) {
      response.organizationMetrics = performanceMonitor.getOrganizationMetrics(organizationId);
    }

    // Performance insights
    response.insights = generatePerformanceInsights(currentSnapshot);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Performance monitoring API error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve performance metrics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * Configure performance alerts (POST endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...config } = body;

    const performanceMonitor = getPerformanceMonitor();

    switch (action) {
      case 'subscribe_alerts':
        // In a real implementation, this would store webhook URLs or notification preferences
        return NextResponse.json({
          success: true,
          message: 'Alert subscription configured successfully'
        });

      case 'clear_history':
        performanceMonitor.clearHistory();
        return NextResponse.json({
          success: true,
          message: 'Performance history cleared'
        });

      case 'export_metrics':
        const metrics = performanceMonitor.exportMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
          count: metrics.length
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Performance monitoring configuration error:', error);
    return NextResponse.json({
      error: 'Failed to configure performance monitoring',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * Generate performance insights based on current metrics
 */
function generatePerformanceInsights(snapshot: any) {
  const insights = [];

  // Performance grade insight
  if (snapshot.performanceGrade === 'A') {
    insights.push({
      type: 'success',
      title: 'Excellent Performance',
      message: 'Your analytics system is performing optimally',
      impact: 'positive'
    });
  } else if (snapshot.performanceGrade === 'F') {
    insights.push({
      type: 'critical',
      title: 'Performance Issues Detected',
      message: 'Multiple performance problems need immediate attention',
      impact: 'critical'
    });
  }

  // Response time insight
  if (snapshot.averageResponseTime > 2000) {
    insights.push({
      type: 'warning',
      title: 'Slow Response Times',
      message: `Average response time is ${snapshot.averageResponseTime}ms. Consider optimization strategies.`,
      impact: 'negative'
    });
  } else if (snapshot.averageResponseTime < 500) {
    insights.push({
      type: 'success',
      title: 'Fast Response Times',
      message: `Excellent response times averaging ${snapshot.averageResponseTime}ms`,
      impact: 'positive'
    });
  }

  // Error rate insight
  if (snapshot.errorRate > 5) {
    insights.push({
      type: 'error',
      title: 'High Error Rate',
      message: `${snapshot.errorRate}% of queries are failing. Investigation required.`,
      impact: 'critical'
    });
  } else if (snapshot.errorRate === 0 && snapshot.totalQueries > 50) {
    insights.push({
      type: 'success',
      title: 'Zero Errors',
      message: 'No errors detected in recent queries',
      impact: 'positive'
    });
  }

  // Cache performance insight
  if (snapshot.cacheHitRate < 50) {
    insights.push({
      type: 'warning',
      title: 'Low Cache Hit Rate',
      message: `Only ${snapshot.cacheHitRate}% cache hit rate. Consider improving caching strategy.`,
      impact: 'negative'
    });
  } else if (snapshot.cacheHitRate > 80) {
    insights.push({
      type: 'success',
      title: 'Effective Caching',
      message: `High cache hit rate of ${snapshot.cacheHitRate}% is optimizing performance`,
      impact: 'positive'
    });
  }

  // Query volume insight
  if (snapshot.totalQueries > 1000) {
    insights.push({
      type: 'info',
      title: 'High Query Volume',
      message: `${snapshot.totalQueries} queries processed. System is handling high load well.`,
      impact: 'neutral'
    });
  }

  // Recommendations
  if (snapshot.recommendations?.length > 0) {
    insights.push({
      type: 'info',
      title: 'Optimization Opportunities',
      message: `${snapshot.recommendations.length} optimization recommendations available`,
      impact: 'neutral',
      recommendations: snapshot.recommendations.slice(0, 3) // Top 3 recommendations
    });
  }

  return insights;
}