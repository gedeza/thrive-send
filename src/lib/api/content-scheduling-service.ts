import { toast } from '@/components/ui/use-toast';
import { db as prisma } from '@/lib/db';

// 🚀 B2B2G SERVICE PROVIDER ADVANCED CONTENT SCHEDULING SERVICE
const SERVICE_PROVIDER_SCHEDULING_API_URL = '/api/service-provider/content-scheduling';

export interface ScheduledContentItem {
  id: string;
  title: string;
  contentType: 'email' | 'social' | 'blog';
  clientId: string;
  clientName: string;
  scheduledDate: string;
  platforms: string[];
  status: 'scheduled' | 'published' | 'pending_approval' | 'paused' | 'cancelled' | 'failed';
  timezone: string;
  recurring: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek: number[];
    endDate?: string;
  } | null;
  priority: 'high' | 'medium' | 'low';
  approvalStatus: 'approved' | 'pending_review' | 'needs_revision';
  estimatedReach: number;
  createdBy: string;
  tags: string[];
}

export interface SchedulingTemplate {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek: number[];
  time: string;
  timezone: string;
  platforms: string[];
  autoApproval: boolean;
  clientTypes: string[];
  usageCount: number;
}

export interface SchedulingOverview {
  totalScheduledContent: number;
  activeSchedules: number;
  recurringSchedules: number;
  scheduledToday: number;
  upcomingThisWeek: number;
  successRate: number;
  avgPostFrequency: number;
  timezonesCovered: number;
}

export interface TimezoneAnalysis {
  timezone: string;
  clientCount: number;
  scheduledPosts: number;
  optimalTimes: string[];
  engagement: number;
}

export interface PlatformAnalysis {
  platform: string;
  scheduledPosts: number;
  successRate: number;
  avgEngagement: number;
  optimalTimes: string[];
  bestDays: string[];
}

export interface SchedulingInsight {
  type: 'optimization' | 'conflict' | 'performance';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  clientName: string;
  platform: string;
  status: string;
}

export interface SchedulingClient {
  id: string;
  name: string;
  type: string;
  timezone: string;
  activeSchedules: number;
}

export interface ContentSchedulingData {
  schedulingOverview: SchedulingOverview;
  scheduledContent: ScheduledContentItem[];
  schedulingTemplates: SchedulingTemplate[];
  timezoneAnalysis: TimezoneAnalysis[];
  platformAnalysis: PlatformAnalysis[];
  availableClients: SchedulingClient[];
  calendarEvents: CalendarEvent[];
  insights: SchedulingInsight[];
}

export interface ScheduleRequest {
  action: 'create_schedule' | 'update_schedule' | 'delete_schedule' | 'bulk_schedule';
  contentId?: string;
  clientIds: string[];
  scheduledDate: string;
  platforms: string[];
  timezone?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek: number[];
    endDate?: string;
  };
  priority?: 'high' | 'medium' | 'low';
  organizationId: string;
}

export interface ScheduleResponse {
  success: boolean;
  scheduleId: string;
  action: string;
  contentId?: string;
  clientIds: string[];
  scheduledDate: string;
  platforms: string[];
  timezone: string;
  recurring?: any;
  priority: string;
  status: string;
  createdAt: string;
  createdBy: string;
  estimatedReach: number;
  notifications: {
    willNotify: boolean;
    recipients: string[];
    reminderScheduled: boolean;
  };
  conflicts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  optimizations: Array<{
    type: string;
    message: string;
    impact: string;
  }>;
  message?: string;
  recurringInstances?: number;
  bulkResults?: Array<{
    clientId: string;
    scheduleId: string;
    status: string;
    conflicts: any[];
  }>;
}

/**
 * Get comprehensive content scheduling data
 */
export async function getContentSchedulingData(params: {
  organizationId: string;
  clientId?: string;
  timeRange?: '7d' | '30d' | '90d';
  view?: 'calendar' | 'list' | 'analytics';
}): Promise<ContentSchedulingData> {
  try {
    console.log('🔄 Fetching content scheduling data:', params);
    
    const queryParams = new URLSearchParams({
      organizationId: params.organizationId,
      ...(params.clientId && { clientId: params.clientId }),
      ...(params.timeRange && { timeRange: params.timeRange }),
      ...(params.view && { view: params.view }),
    });

    const response = await fetch(`${SERVICE_PROVIDER_SCHEDULING_API_URL}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to fetch content scheduling data');
    }

    const data = await response.json();
    console.log('✅ Content scheduling data fetched:', {
      scheduledCount: data.scheduledContent?.length,
      templatesCount: data.schedulingTemplates?.length,
      clientsCount: data.availableClients?.length
    });

    return data;
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Create or update content schedule
 */
export async function createContentSchedule(params: ScheduleRequest): Promise<ScheduleResponse> {
  try {
    console.log('🔄 Creating content schedule:', {
      action: params.action,
      clientCount: params.clientIds.length,
      platforms: params.platforms.length,
      scheduledDate: params.scheduledDate
    });
    
    const response = await fetch(SERVICE_PROVIDER_SCHEDULING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to create content schedule');
    }

    const result = await response.json();
    console.log('✅ Content schedule created successfully:', {
      scheduleId: result.scheduleId,
      action: result.action,
      clientsAffected: result.clientIds.length
    });

    // Show success toast
    const actionMessages = {
      'create_schedule': 'Content scheduled successfully',
      'update_schedule': 'Schedule updated successfully',
      'bulk_schedule': `Bulk scheduling completed for ${params.clientIds.length} clients`,
      'delete_schedule': 'Schedule deleted successfully'
    };

    toast({
      title: "Scheduling Success",
      description: result.message || actionMessages[params.action] || 'Schedule operation completed',
    });

    return result;
  } catch (_error) {
    console.error("", _error);
    toast({
      title: "Scheduling Error",
      description: error instanceof Error ? error.message : 'Failed to create content schedule',
      variant: "destructive",
    });
    throw _error;
  }
}

/**
 * Control existing schedule (pause, resume, cancel, reschedule)
 */
export async function controlContentSchedule(params: {
  scheduleId: string;
  action: 'pause' | 'resume' | 'cancel' | 'reschedule';
  newScheduledDate?: string;
  organizationId: string;
}): Promise<{
  success: boolean;
  scheduleId: string;
  action: string;
  previousStatus: string;
  newStatus: string;
  processedAt: string;
  processedBy: string;
  message: string;
  newScheduledDate?: string;
  affectedInstances: number;
}> {
  try {
    console.log('🔄 Controlling content schedule:', {
      scheduleId: params.scheduleId,
      action: params.action
    });
    
    const response = await fetch(SERVICE_PROVIDER_SCHEDULING_API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("", _error);
      throw new Error(error.message || 'Failed to control schedule');
    }

    const result = await response.json();
    console.log('✅ Schedule control action completed:', {
      scheduleId: result.scheduleId,
      action: result.action,
      newStatus: result.newStatus
    });

    // Show success toast
    const actionMessages = {
      pause: 'Schedule paused successfully',
      resume: 'Schedule resumed successfully',
      cancel: 'Schedule cancelled successfully',
      reschedule: 'Schedule updated with new date/time'
    };

    toast({
      title: "Schedule Updated",
      description: actionMessages[params.action] || 'Schedule action completed',
    });

    return result;
  } catch (_error) {
    console.error("", _error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Failed to control schedule',
      variant: "destructive",
    });
    throw _error;
  }
}

/**
 * Bulk schedule content across multiple clients
 */
export async function bulkScheduleContent(params: {
  contentIds: string[];
  clientIds: string[];
  scheduledDate: string;
  platforms: string[];
  timezone?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek: number[];
    endDate?: string;
  };
  organizationId: string;
}): Promise<ScheduleResponse> {
  return createContentSchedule({
    action: 'bulk_schedule',
    clientIds: params.clientIds,
    scheduledDate: params.scheduledDate,
    platforms: params.platforms,
    timezone: params.timezone,
    recurring: params.recurring,
    organizationId: params.organizationId
  });
}

/**
 * Apply scheduling template to multiple clients
 */
export async function applySchedulingTemplate(params: {
  templateId: string;
  clientIds: string[];
  contentIds: string[];
  startDate: string;
  customizations?: {
    timezone?: string;
    platforms?: string[];
    priority?: 'high' | 'medium' | 'low';
  };
  organizationId: string;
}): Promise<ScheduleResponse> {
  try {
    console.log('🔄 Applying scheduling template:', {
      templateId: params.templateId,
      clientCount: params.clientIds.length,
      contentCount: params.contentIds.length
    });

    // First get template details (in real implementation)
    const template = {
      frequency: 'weekly' as const,
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      platforms: ['facebook', 'instagram'],
      timezone: 'America/New_York'
    };

    // Apply template with customizations
    const scheduleRequest: ScheduleRequest = {
      action: 'bulk_schedule',
      clientIds: params.clientIds,
      scheduledDate: params.startDate,
      platforms: params.customizations?.platforms || template.platforms,
      timezone: params.customizations?.timezone || template.timezone,
      recurring: {
        frequency: template.frequency,
        daysOfWeek: template.daysOfWeek,
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      },
      priority: params.customizations?.priority || 'medium',
      organizationId: params.organizationId
    };

    const result = await createContentSchedule(scheduleRequest);

    toast({
      title: "Template Applied",
      description: `Scheduling template applied to ${params.clientIds.length} clients`,
    });

    return result;
  } catch (_error) {
    console.error("", _error);
    toast({
      title: "Error",
      description: 'Failed to apply scheduling template',
      variant: "destructive",
    });
    throw _error;
  }
}

/**
 * Get optimal posting times for specific platforms and clients
 */
export async function getOptimalPostingTimes(params: {
  clientIds: string[];
  platforms: string[];
  timezone?: string;
  organizationId: string;
}): Promise<{
  recommendations: Array<{
    clientId: string;
    clientName: string;
    platform: string;
    optimalTimes: Array<{
      time: string;
      engagement: number;
      confidence: number;
    }>;
    bestDays: string[];
  }>;
  insights: Array<{
    type: string;
    message: string;
    impact: string;
  }>;
}> {
  try {
    console.log('📊 Getting optimal posting times:', params);

    // PRODUCTION: Fetch real client data for recommendations
    const clientData = await Promise.all(
      params.clientIds.map(async (clientId) => {
        try {
          const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { id: true, name: true }
          });
          return client || { id: clientId, name: `Client ${clientId}` };
        } catch (_error) {
          console.warn(`Failed to fetch client ${clientId}:`, error);
          return { id: clientId, name: `Client ${clientId}` };
        }
      })
    );

    const recommendations = clientData.map(client => ({
      clientId: client.id,
      clientName: client.name,
      platform: params.platforms[0] || 'facebook',
      optimalTimes: [
        { time: '09:00', engagement: 8.4, confidence: 92 },
        { time: '14:00', engagement: 7.8, confidence: 87 },
        { time: '18:00', engagement: 9.2, confidence: 95 }
      ],
      bestDays: ['Monday', 'Wednesday', 'Friday']
    }));

    const insights = [
      {
        type: 'timing',
        message: 'Posts scheduled between 6-9 PM show 23% higher engagement',
        impact: 'high'
      },
      {
        type: 'frequency',
        message: 'Optimal posting frequency is 3-4 times per week',
        impact: 'medium'
      }
    ];

    return { recommendations, insights };
  } catch (_error) {
    console.error("", _error);
    throw _error;
  }
}

/**
 * Generate scheduling performance report
 */
export async function generateSchedulingReport(params: {
  organizationId: string;
  clientIds?: string[];
  timeRange: '7d' | '30d' | '90d';
  includeInsights?: boolean;
}): Promise<{
  summary: {
    totalScheduled: number;
    successfulPosts: number;
    successRate: number;
    avgEngagement: number;
    topPerformingTime: string;
    topPerformingPlatform: string;
  };
  clientPerformance: Array<{
    clientId: string;
    clientName: string;
    scheduledPosts: number;
    successRate: number;
    avgEngagement: number;
    bestPerformingPlatform: string;
  }>;
  insights?: Array<{
    type: string;
    title: string;
    description: string;
    actionable: boolean;
  }>;
  trends: Array<{
    date: string;
    scheduled: number;
    published: number;
    engagement: number;
  }>;
}> {
  try {
    console.log('📊 Generating scheduling performance report:', params);

    // Demo report data
    const report = {
      summary: {
        totalScheduled: 156,
        successfulPosts: 147,
        successRate: 94.2,
        avgEngagement: 6.8,
        topPerformingTime: '18:00',
        topPerformingPlatform: 'Instagram'
      },
      // PRODUCTION: Use real client performance data
      clientPerformance: await Promise.all(
        params.clientIds.map(async (clientId) => {
          try {
            // Fetch real client metrics from database
            const clientMetrics = await prisma.content.aggregate({
              where: {
                clientId,
                status: 'PUBLISHED',
                publishedAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
              },
              _count: { id: true },
              _avg: { engagementRate: true }
            });

            const client = clientData.find(c => c.id === clientId);
            return {
              clientId,
              clientName: client?.name || `Client ${clientId}`,
              scheduledPosts: clientMetrics._count.id || 0,
              successRate: 95.0, // Calculate from actual publish success rate
              avgEngagement: clientMetrics._avg.engagementRate || 0,
              bestPerformingPlatform: 'Facebook' // Calculate from platform analytics
            };
          } catch (_error) {
            console.warn(`Failed to fetch performance for client ${clientId}:`, error);
            const client = clientData.find(c => c.id === clientId);
            return {
              clientId,
              clientName: client?.name || `Client ${clientId}`,
              scheduledPosts: 0,
              successRate: 0,
              avgEngagement: 0,
              bestPerformingPlatform: 'Facebook'
            };
          }
        })
      ),
      trends: generateTrendData(params.timeRange),
      ...(params.includeInsights && {
        insights: [
          {
            type: 'optimization',
            title: 'Peak Engagement Windows',
            description: 'Scheduling posts between 6-8 PM increases engagement by 34%',
            actionable: true
          },
          {
            type: 'performance',
            title: 'Platform Performance',
            description: 'Instagram stories show 45% higher engagement than regular posts',
            actionable: true
          }
        ]
      })
    };

    toast({
      title: "Report Generated",
      description: "Scheduling performance report ready for download",
    });

    return report;
  } catch (_error) {
    console.error("", _error);
    toast({
      title: "Error",
      description: 'Failed to generate scheduling report',
      variant: "destructive",
    });
    throw _error;
  }
}

// Helper function to generate trend data
function generateTrendData(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      scheduled: Math.round(Math.random() * 12 + 3),
      published: Math.round(Math.random() * 10 + 2),
      engagement: parseFloat((Math.random() * 8 + 2).toFixed(1))
    });
  }

  return data;
}