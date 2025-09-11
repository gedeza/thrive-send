/**
 * Real Analytics Service - Production Ready
 * Replaces all mock data with actual database queries
 */

import { db as prisma } from '@/lib/db';
import { subDays, startOfDay, endOfDay, format, addDays, isAfter, isBefore } from 'date-fns';

export interface RealAnalyticsMetrics {
  totalViews: number;
  engagementRate: string;
  conversionRate: string;
  totalRevenue: string;
  viewsChange: number;
  engagementChange: number;
  conversionsChange: number;
  revenueChange: number;
  totalReach: number;
  reachChange: number;
  totalConversions: number;
}

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  totalViews: number;
  engagementRate: number;
  conversionRate: number;
  revenue: number;
  contentCount: number;
  projectCount: number;
}

/**
 * Real Analytics Service Class
 * Provides production-ready analytics data from database
 */
export class RealAnalyticsService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Get comprehensive analytics metrics for dashboard
   */
  async getDashboardMetrics(dateRange?: DateRangeFilter): Promise<RealAnalyticsMetrics> {
    const { startDate, endDate } = this.getDateRange(dateRange);
    const previousPeriod = this.getPreviousPeriod(startDate, endDate);

    try {
      // Get current period analytics
      const currentAnalytics = await this.getAnalyticsForPeriod(startDate, endDate);
      const previousAnalytics = await this.getAnalyticsForPeriod(previousPeriod.start, previousPeriod.end);

      // Get content analytics
      const contentStats = await this.getContentAnalytics(startDate, endDate);
      const previousContentStats = await this.getContentAnalytics(previousPeriod.start, previousPeriod.end);

      // Get revenue data
      const revenueStats = await this.getRevenueAnalytics(startDate, endDate);
      const previousRevenueStats = await this.getRevenueAnalytics(previousPeriod.start, previousPeriod.end);

      // Calculate metrics
      const totalViews = contentStats.reduce((sum, stat) => sum + stat.views, 0);
      const previousViews = previousContentStats.reduce((sum, stat) => sum + stat.views, 0);

      const totalEngagement = contentStats.reduce((sum, stat) => sum + stat.likes + stat.shares + stat.comments, 0);
      const previousEngagement = previousContentStats.reduce((sum, stat) => sum + stat.likes + stat.shares + stat.comments, 0);

      const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
      const previousEngagementRate = previousViews > 0 ? (previousEngagement / previousViews) * 100 : 0;

      const totalConversions = currentAnalytics.reduce((sum, analytics) => sum + (analytics.clicks || 0), 0);
      const previousConversions = previousAnalytics.reduce((sum, analytics) => sum + (analytics.clicks || 0), 0);

      const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;
      const previousConversionRate = previousViews > 0 ? (previousConversions / previousViews) * 100 : 0;

      const totalRevenue = revenueStats.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      const previousRevenue = previousRevenueStats.reduce((sum, revenue) => sum + Number(revenue.amount), 0);

      const totalReach = currentAnalytics.reduce((sum, analytics) => sum + analytics.reachCount, 0);
      const previousReach = previousAnalytics.reduce((sum, analytics) => sum + analytics.reachCount, 0);

      return {
        totalViews,
        engagementRate: `${engagementRate.toFixed(1)}%`,
        conversionRate: `${conversionRate.toFixed(1)}%`,
        totalRevenue: `$${totalRevenue.toLocaleString()}`,
        viewsChange: this.calculatePercentageChange(totalViews, previousViews),
        engagementChange: this.calculatePercentageChange(engagementRate, previousEngagementRate),
        conversionsChange: this.calculatePercentageChange(totalConversions, previousConversions),
        revenueChange: this.calculatePercentageChange(totalRevenue, previousRevenue),
        totalReach,
        reachChange: this.calculatePercentageChange(totalReach, previousReach),
        totalConversions,
      };
    } catch (_error) {
      console.error("", _error);
      throw new Error('Failed to fetch analytics metrics');
    }
  }

  /**
   * Get analytics data for specific period
   */
  private async getAnalyticsForPeriod(startDate: Date, endDate: Date) {
    return await prisma.analytics.findMany({
      where: {
        client: {
          organizationId: this.organizationId,
        },
        lastActivity: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get content analytics for period
   */
  private async getContentAnalytics(startDate: Date, endDate: Date) {
    return await prisma.contentAnalytics.findMany({
      where: {
        content: {
          organizationId: this.organizationId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            clientId: true,
          },
        },
      },
    });
  }

  /**
   * Get revenue analytics for period
   */
  private async getRevenueAnalytics(startDate: Date, endDate: Date) {
    return await prisma.marketplaceRevenue.findMany({
      where: {
        organizationId: this.organizationId,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  /**
   * Get client-specific metrics
   */
  async getClientMetrics(clientId?: string, dateRange?: DateRangeFilter): Promise<ClientMetrics[]> {
    const { startDate, endDate } = this.getDateRange(dateRange);

    try {
      const whereClause: any = {
        organizationId: this.organizationId,
      };

      if (clientId) {
        whereClause.id = clientId;
      }

      const clients = await prisma.client.findMany({
        where: whereClause,
        include: {
          analytics: {
            where: {
              lastActivity: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          content: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              analytics: true,
            },
          },
          projects: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          marketplaceRevenue: {
            where: {
              transactionDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      });

      return clients.map(client => {
        const totalViews = client.content.reduce((sum, content) => 
          sum + (content.analytics?.views || 0), 0
        );

        const totalEngagement = client.content.reduce((sum, content) => 
          sum + (content.analytics?.likes || 0) + 
              (content.analytics?.shares || 0) + 
              (content.analytics?.comments || 0), 0
        );

        const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

        const totalConversions = client.analytics.reduce((sum, analytics) => 
          sum + (analytics.clicks || 0), 0
        );

        const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

        const revenue = client.marketplaceRevenue.reduce((sum, rev) => 
          sum + Number(rev.amount), 0
        );

        return {
          clientId: client.id,
          clientName: client.name,
          totalViews,
          engagementRate: Math.round(engagementRate * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          revenue,
          contentCount: client.content.length,
          projectCount: client.projects.length,
        };
      });
    } catch (_error) {
      console.error("", _error);
      throw new Error('Failed to fetch client metrics');
    }
  }

  /**
   * Get cross-client analytics
   */
  async getCrossClientAnalytics(dateRange?: DateRangeFilter) {
    const { startDate, endDate } = this.getDateRange(dateRange);

    try {
      return await prisma.crossClientAnalytics.findMany({
        where: {
          organizationId: this.organizationId,
          dateRangeStart: {
            gte: startDate,
          },
          dateRangeEnd: {
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (_error) {
      console.error("", _error);
      throw new Error('Failed to fetch cross-client analytics');
    }
  }

  /**
   * Get performance trend data for charts
   */
  async getPerformanceTrend(dateRange?: DateRangeFilter) {
    const { startDate, endDate } = this.getDateRange(dateRange);
    const days = [];
    const current = new Date(startDate);

    // Generate daily data points
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    try {
      const dailyMetrics = await Promise.all(
        days.map(async (day) => {
          const dayStart = startOfDay(day);
          const dayEnd = endOfDay(day);

          const [contentStats, analytics] = await Promise.all([
            this.getContentAnalytics(dayStart, dayEnd),
            this.getAnalyticsForPeriod(dayStart, dayEnd),
          ]);

          const views = contentStats.reduce((sum, stat) => sum + stat.views, 0);
          const engagement = contentStats.reduce((sum, stat) => 
            sum + stat.likes + stat.shares + stat.comments, 0
          );
          const conversions = analytics.reduce((sum, analytic) => sum + (analytic.clicks || 0), 0);

          return {
            date: format(day, 'MMM dd'),
            views,
            engagement,
            conversions,
          };
        })
      );

      return dailyMetrics;
    } catch (_error) {
      console.error("", _error);
      throw new Error('Failed to fetch performance trend data');
    }
  }

  /**
   * Utility methods
   */
  private getDateRange(dateRange?: DateRangeFilter): { startDate: Date; endDate: Date } {
    if (dateRange) {
      return dateRange;
    }

    // Default to last 30 days
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, 29));

    return { startDate, endDate };
  }

  private getPreviousPeriod(startDate: Date, endDate: Date): { start: Date; end: Date } {
    const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousEnd = subDays(startDate, 1);
    const previousStart = subDays(previousEnd, periodLength - 1);

    return {
      start: startOfDay(previousStart),
      end: endOfDay(previousEnd),
    };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}

/**
 * Factory function to create analytics service instance
 */
export function createRealAnalyticsService(organizationId: string): RealAnalyticsService {
  return new RealAnalyticsService(organizationId);
}

/**
 * Get analytics metrics for organization - convenience function
 */
export async function getRealAnalyticsMetrics(
  organizationId: string,
  dateRange?: DateRangeFilter
): Promise<RealAnalyticsMetrics> {
  const service = createRealAnalyticsService(organizationId);
  return await service.getDashboardMetrics(dateRange);
}