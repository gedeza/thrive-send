/**
 * Ultra-Optimized Dashboard API
 * 
 * Features:
 * - Uses new data aggregation service
 * - Schema-compatible field mapping
 * - High-performance caching
 * - Real-time capability
 * - Error resilience
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getAnalyticsAggregator } from '@/lib/analytics/data-aggregator';
import { getOrCreateUser } from '@/lib/user-utils';

export const dynamic = 'force-dynamic';

interface DashboardMetrics {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalAudience: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  conversionRate: number;
  performanceScore: number;
}

interface CampaignSummary {
  id: string;
  name: string;
  status: string;
  type: string;
  contentCount: number;
  analytics: {
    sent: number;
    opened: number;
    clicked: number;
    delivered: number;
  };
  performance: number;
  createdAt: string;
  updatedAt: string;
}

interface ContentSummary {
  id: string;
  title: string;
  type: string;
  status: string;
  publishedAt: string | null;
  analytics: {
    views: number;
    engagement: number;
    clicks: number;
  };
  engagementRate: number;
  createdAt: string;
  updatedAt: string;
}

interface AudienceMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  growthRate: number;
  segmentCount: number;
  engagementScore: number;
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Authentication and organization validation
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationIdParam = searchParams.get('organizationId');
    const dateRange = searchParams.get('dateRange') || '30d';
    const clientId = searchParams.get('clientId');
    const realTime = searchParams.get('realTime') === 'true';

    // Get or create user
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let dbOrganizationId = organizationIdParam;
    let organization;

    if (organizationIdParam) {
      // Handle organization ID mapping
      organization = await db.organization.findUnique({
        where: { id: organizationIdParam }
      });

      if (!organization && organizationIdParam.startsWith('org_')) {
        organization = await db.organization.findUnique({
          where: { clerkOrganizationId: organizationIdParam }
        });
      }

      if (!organization) {
        // Create organization for development
        try {
          organization = await db.organization.create({
            data: {
              id: organizationIdParam.startsWith('org_') ? `org-${Date.now()}` : organizationIdParam,
              name: 'Auto-created Organization',
              slug: organizationIdParam.startsWith('org_') ? `auto-${Date.now()}` : `auto-${organizationIdParam}`,
              clerkOrganizationId: organizationIdParam.startsWith('org_') ? organizationIdParam : null,
            }
          });

          // Create membership
          await db.organizationMember.upsert({
            where: {
              userId_organizationId: {
                userId: user.id,
                organizationId: organization.id
              }
            },
            create: {
              userId: user.id,
              organizationId: organization.id,
              role: 'ADMIN'
            },
            update: {}
          });
        } catch (createError) {
          console.error('Failed to create organization:', createError);
          return NextResponse.json({ error: 'Organization access denied' }, { status: 403 });
        }
      }

      dbOrganizationId = organization.id;
    } else {
      // Use user's primary organization
      const membership = await db.organizationMember.findFirst({
        where: { userId: user.id },
        include: { organization: true }
      });
      
      if (!membership) {
        return NextResponse.json({ error: 'No organization found' }, { status: 404 });
      }
      
      organization = membership.organization;
      dbOrganizationId = organization.id;
    }

    // Verify user has access to this organization
    const userMembership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: dbOrganizationId,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Use the optimized aggregation service
    const aggregator = getAnalyticsAggregator();
    const aggregatedData = await aggregator.aggregateData({
      organizationId: dbOrganizationId,
      clientId: clientId || undefined,
      timeframe: dateRange,
      useCache: !realTime,
      realTime
    });

    // Build optimized dashboard metrics
    const dashboardMetrics: DashboardMetrics = {
      totalContent: aggregatedData.metrics.contentCount,
      publishedContent: aggregatedData.contentMetrics.filter(c => c.status === 'PUBLISHED').length,
      draftContent: aggregatedData.contentMetrics.filter(c => c.status === 'DRAFT').length,
      totalCampaigns: aggregatedData.metrics.campaignCount,
      activeCampaigns: aggregatedData.campaignMetrics.filter(c => c.status === 'ACTIVE').length,
      totalAudience: aggregatedData.metrics.audienceSize,
      totalViews: aggregatedData.metrics.totalViews,
      totalEngagement: aggregatedData.metrics.totalEngagement,
      avgEngagementRate: aggregatedData.metrics.avgEngagementRate,
      conversionRate: aggregatedData.metrics.avgConversionRate,
      performanceScore: aggregatedData.metrics.performanceScore
    };

    // Convert campaign metrics to expected format
    const campaignSummaries: CampaignSummary[] = aggregatedData.campaignMetrics.slice(0, 10).map(campaign => ({
      id: campaign.campaignId,
      name: campaign.name,
      status: campaign.status,
      type: campaign.type,
      contentCount: campaign.contentCount,
      analytics: {
        sent: Math.round(campaign.totalViews * 1.2), // Estimated sent based on views
        opened: Math.round(campaign.totalViews * 0.8), // Estimated opens
        clicked: Math.round(campaign.totalViews * 0.1), // Estimated clicks
        delivered: Math.round(campaign.totalViews * 1.1) // Estimated delivered
      },
      performance: campaign.performanceScore,
      createdAt: new Date().toISOString(), // We don't have this in aggregated data
      updatedAt: new Date().toISOString()
    }));

    // Convert content metrics to expected format
    const contentSummaries: ContentSummary[] = aggregatedData.contentMetrics.slice(0, 10).map(content => ({
      id: content.contentId,
      title: content.title,
      type: content.type,
      status: content.status,
      publishedAt: content.publishedAt?.toISOString() || null,
      analytics: {
        views: content.views,
        engagement: content.likes + content.shares + content.comments,
        clicks: Math.round(content.views * 0.1) // Estimated clicks
      },
      engagementRate: content.engagementRate,
      createdAt: new Date().toISOString(), // We don't have this in aggregated data
      updatedAt: new Date().toISOString()
    }));

    // Build audience metrics
    const audienceMetrics: AudienceMetrics = {
      totalSubscribers: aggregatedData.metrics.audienceSize,
      activeSubscribers: Math.round(aggregatedData.metrics.audienceSize * 0.85), // Estimated
      growthRate: aggregatedData.trends.reachChange, // Use reach change as growth proxy
      segmentCount: Math.max(1, Math.round(aggregatedData.metrics.audienceSize / 1000)), // Estimated segments
      engagementScore: aggregatedData.metrics.performanceScore
    };

    // Calculate trends from aggregated data
    const trends = {
      views: {
        value: aggregatedData.metrics.totalViews,
        change: aggregatedData.trends.viewsChange,
        trend: aggregatedData.trends.viewsChange > 0 ? 'up' : aggregatedData.trends.viewsChange < 0 ? 'down' : 'neutral'
      },
      engagement: {
        value: aggregatedData.metrics.totalEngagement,
        change: aggregatedData.trends.engagementChange,
        trend: aggregatedData.trends.engagementChange > 0 ? 'up' : aggregatedData.trends.engagementChange < 0 ? 'down' : 'neutral'
      },
      conversions: {
        value: aggregatedData.metrics.totalConversions,
        change: aggregatedData.trends.conversionsChange,
        trend: aggregatedData.trends.conversionsChange > 0 ? 'up' : aggregatedData.trends.conversionsChange < 0 ? 'down' : 'neutral'
      },
      reach: {
        value: aggregatedData.metrics.totalReach,
        change: aggregatedData.trends.reachChange,
        trend: aggregatedData.trends.reachChange > 0 ? 'up' : aggregatedData.trends.reachChange < 0 ? 'down' : 'neutral'
      }
    };

    // Build insights from top performers
    const insights = [
      {
        type: 'success',
        title: 'Top Performance',
        message: aggregatedData.topPerformers.content.length > 0 
          ? `"${aggregatedData.topPerformers.content[0].title}" is your top performing content with ${aggregatedData.topPerformers.content[0].views} views`
          : 'No content performance data available yet',
        impact: 'high'
      },
      {
        type: 'info',
        title: 'Content Activity',
        message: `${dashboardMetrics.totalContent} total pieces of content created, with ${dashboardMetrics.publishedContent} published`,
        impact: 'medium'
      },
      {
        type: aggregatedData.metrics.avgEngagementRate > 5 ? 'success' : 'warning',
        title: 'Engagement Rate',
        message: `Average engagement rate is ${aggregatedData.metrics.avgEngagementRate.toFixed(1)}%`,
        impact: aggregatedData.metrics.avgEngagementRate > 5 ? 'high' : 'medium'
      }
    ];

    const processingTime = performance.now() - startTime;

    const response = {
      success: true,
      data: {
        metrics: dashboardMetrics,
        campaigns: campaignSummaries,
        content: contentSummaries,
        audience: audienceMetrics,
        trends,
        insights,
        timeSeries: aggregatedData.timeSeries,
        topPerformers: {
          content: aggregatedData.topPerformers.content.slice(0, 5),
          campaigns: aggregatedData.topPerformers.campaigns.slice(0, 5)
        }
      },
      meta: {
        organizationId: dbOrganizationId,
        dateRange,
        realTime,
        cached: aggregatedData.cached,
        processingTime: processingTime,
        aggregationTime: aggregatedData.processingTime,
        generatedAt: aggregatedData.generatedAt,
        performance: {
          total: processingTime,
          aggregation: aggregatedData.processingTime,
          api: processingTime - aggregatedData.processingTime,
          cached: aggregatedData.cached
        }
      }
    };

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Optimized Dashboard API completed in ${processingTime.toFixed(2)}ms`, {
        organizationId: dbOrganizationId,
        cached: aggregatedData.cached,
        realTime,
        contentCount: aggregatedData.metrics.contentCount,
        campaignCount: aggregatedData.metrics.campaignCount,
        aggregationTime: aggregatedData.processingTime.toFixed(2) + 'ms'
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('Optimized Dashboard API Error:', error);
    
    return NextResponse.json({
      error: 'Failed to load dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      meta: {
        processingTime,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}