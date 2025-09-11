import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const clientId = searchParams.get('clientId') || 'all';
    const view = searchParams.get('view') || 'calendar';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const demoSchedules = [
      {
        id: 'schedule-1',
        title: 'Municipal Newsletter - Weekly',
        contentType: 'newsletter',
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        scheduleType: 'recurring',
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '09:00',
        timezone: 'America/New_York',
        status: 'active',
        nextRun: '2025-08-05T09:00:00Z',
        createdAt: '2025-07-15T10:00:00Z',
        templateId: 'template-1',
        template: {
          name: 'Municipal Newsletter Template',
          fields: ['CLIENT_NAME', 'EVENT_DATE', 'ANNOUNCEMENT_TEXT']
        },
        recurring: {
          pattern: 'weekly',
          interval: 1,
          daysOfWeek: [1],
          endDate: null,
          occurrences: null
        },
        socialPlatforms: ['facebook', 'twitter', 'linkedin'],
        approval: {
          required: true,
          approvers: ['user-1', 'user-2'],
          autoApprove: false
        }
      },
      {
        id: 'schedule-2',
        title: 'Community Events Promotion',
        contentType: 'social_post',
        clientId: 'demo-client-2',
        clientName: 'Township Council',
        scheduleType: 'recurring',
        frequency: 'biweekly',
        dayOfWeek: 3,
        time: '14:30',
        timezone: 'America/New_York',
        status: 'active',
        nextRun: '2025-08-06T14:30:00Z',
        createdAt: '2025-07-20T11:00:00Z',
        templateId: 'template-2',
        template: {
          name: 'Event Promotion Template',
          fields: ['EVENT_NAME', 'EVENT_DATE', 'VENUE', 'TICKET_INFO']
        },
        recurring: {
          pattern: 'biweekly',
          interval: 2,
          daysOfWeek: [3],
          endDate: '2025-12-31T23:59:59Z',
          occurrences: null
        },
        socialPlatforms: ['facebook', 'instagram', 'twitter'],
        approval: {
          required: true,
          approvers: ['user-3'],
          autoApprove: false
        }
      },
      {
        id: 'schedule-3',
        title: 'Monthly Budget Report',
        contentType: 'report',
        clientId: 'demo-client-3',
        clientName: 'State Department',
        scheduleType: 'recurring',
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '08:00',
        timezone: 'America/New_York',
        status: 'active',
        nextRun: '2025-09-01T08:00:00Z',
        createdAt: '2025-07-10T09:00:00Z',
        templateId: 'template-3',
        template: {
          name: 'Budget Report Template',
          fields: ['REPORT_MONTH', 'BUDGET_TOTAL', 'EXPENSES', 'VARIANCE']
        },
        recurring: {
          pattern: 'monthly',
          interval: 1,
          dayOfMonth: 1,
          endDate: null,
          occurrences: 12
        },
        socialPlatforms: [],
        approval: {
          required: true,
          approvers: ['user-1', 'user-4'],
          autoApprove: false
        }
      },
      {
        id: 'schedule-4',
        title: 'Emergency Alert System Test',
        contentType: 'alert',
        clientId: 'demo-client-1',
        clientName: 'City of Springfield',
        scheduleType: 'one_time',
        scheduledDate: '2025-08-15T10:00:00Z',
        timezone: 'America/New_York',
        status: 'scheduled',
        nextRun: '2025-08-15T10:00:00Z',
        createdAt: '2025-08-01T14:00:00Z',
        templateId: 'template-4',
        template: {
          name: 'Emergency Alert Template',
          fields: ['ALERT_TYPE', 'MESSAGE', 'SEVERITY_LEVEL']
        },
        socialPlatforms: ['twitter', 'facebook'],
        approval: {
          required: false,
          approvers: [],
          autoApprove: true
        }
      },
      {
        id: 'schedule-5',
        title: 'Cross-Client Analytics Report',
        contentType: 'analytics',
        clientId: 'all',
        clientName: 'All Clients',
        scheduleType: 'recurring',
        frequency: 'monthly',
        dayOfMonth: 15,
        time: '16:00',
        timezone: 'America/New_York',
        status: 'active',
        nextRun: '2025-08-15T16:00:00Z',
        createdAt: '2025-07-25T12:00:00Z',
        templateId: 'template-5',
        template: {
          name: 'Cross-Client Analytics Template',
          fields: ['REPORT_PERIOD', 'TOP_PERFORMERS', 'INSIGHTS', 'RECOMMENDATIONS']
        },
        recurring: {
          pattern: 'monthly',
          interval: 1,
          dayOfMonth: 15,
          endDate: null,
          occurrences: null
        },
        socialPlatforms: [],
        approval: {
          required: true,
          approvers: ['user-1'],
          autoApprove: false
        }
      }
    ];

    let filteredSchedules = demoSchedules;

    if (clientId && clientId !== 'all') {
      filteredSchedules = demoSchedules.filter(schedule => 
        schedule.clientId === clientId || schedule.clientId === 'all'
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredSchedules = filteredSchedules.filter(schedule => {
        const nextRun = new Date(schedule.nextRun);
        return nextRun >= start && nextRun <= end;
      });
    }

    const schedulingData = {
      schedules: filteredSchedules,
      summary: {
        total: filteredSchedules.length,
        active: filteredSchedules.filter(s => s.status === 'active').length,
        scheduled: filteredSchedules.filter(s => s.status === 'scheduled').length,
        paused: filteredSchedules.filter(s => s.status === 'paused').length,
        recurring: filteredSchedules.filter(s => s.scheduleType === 'recurring').length,
        oneTime: filteredSchedules.filter(s => s.scheduleType === 'one_time').length
      },
      upcomingRuns: filteredSchedules
        .filter(s => s.status === 'active' || s.status === 'scheduled')
        .sort((a, b) => new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime())
        .slice(0, 10)
        .map(schedule => ({
          id: schedule.id,
          title: schedule.title,
          clientName: schedule.clientName,
          nextRun: schedule.nextRun,
          contentType: schedule.contentType,
          requiresApproval: schedule.approval.required
        })),
      clients: [
        { id: 'all', name: 'All Clients', scheduleCount: demoSchedules.length },
        { id: 'demo-client-1', name: 'City of Springfield', scheduleCount: 2 },
        { id: 'demo-client-2', name: 'Township Council', scheduleCount: 1 },
        { id: 'demo-client-3', name: 'State Department', scheduleCount: 1 }
      ]
    };

    return NextResponse.json(schedulingData);
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      organizationId,
      title,
      contentType,
      clientId,
      scheduleType,
      templateId,
      scheduledDate,
      frequency,
      dayOfWeek,
      dayOfMonth,
      time,
      timezone,
      socialPlatforms,
      approval,
      recurring
    } = body;

    if (!organizationId || !title || !contentType || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newSchedule = {
      id: `schedule-${Date.now()}`,
      title,
      contentType,
      clientId,
      clientName: clientId === 'demo-client-1' ? 'City of Springfield' :
                 clientId === 'demo-client-2' ? 'Township Council' :
                 clientId === 'demo-client-3' ? 'State Department' : 'All Clients',
      scheduleType,
      frequency: scheduleType === 'recurring' ? frequency : undefined,
      dayOfWeek: scheduleType === 'recurring' && frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: scheduleType === 'recurring' && frequency === 'monthly' ? dayOfMonth : undefined,
      time: scheduleType === 'recurring' ? time : undefined,
      scheduledDate: scheduleType === 'one_time' ? scheduledDate : undefined,
      timezone: timezone || 'America/New_York',
      status: 'active',
      nextRun: scheduleType === 'one_time' ? scheduledDate : 
               new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      templateId,
      template: {
        name: `Template ${templateId}`,
        fields: ['FIELD_1', 'FIELD_2', 'FIELD_3']
      },
      recurring: scheduleType === 'recurring' ? recurring : undefined,
      socialPlatforms: socialPlatforms || [],
      approval: approval || {
        required: true,
        approvers: [userId],
        autoApprove: false
      }
    };

    return NextResponse.json({
      success: true,
      schedule: newSchedule,
      message: 'Schedule created successfully'
    });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId, action, ...updateData } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    let message = 'Schedule updated successfully';

    if (action === 'pause') {
      message = 'Schedule paused successfully';
    } else if (action === 'resume') {
      message = 'Schedule resumed successfully';
    } else if (action === 'cancel') {
      message = 'Schedule cancelled successfully';
    }

    return NextResponse.json({
      success: true,
      message,
      schedule: {
        id: scheduleId,
        status: action === 'pause' ? 'paused' : 
                action === 'resume' ? 'active' : 
                action === 'cancel' ? 'cancelled' : 'active',
        updatedAt: new Date().toISOString(),
        ...updateData
      }
    });
  } catch (_error) {
    console.error("", _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}