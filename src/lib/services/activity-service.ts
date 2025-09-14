import { prisma } from '@/lib/prisma';
import { Activity, activitySchema } from '@/types/activity';
import { errorLogger } from '@/lib/error/errorLogger';
import { Prisma } from '@prisma/client';

export class ActivityService {
  private static instance: ActivityService;
  private eventSource: EventSource | null = null;
  private subscribers: Set<(activity: Activity) => void> = new Set();

  private constructor() {}

  static getInstance(): ActivityService {
    if (!ActivityService.instance) {
      ActivityService.instance = new ActivityService();
    }
    return ActivityService.instance;
  }

  // Subscribe to real-time activity updates
  subscribe(callback: (activity: Activity) => void): () => void {
    this.subscribers.add(callback);
    
    if (!this.eventSource) {
      this.connectEventSource();
    }

    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.disconnectEventSource();
      }
    };
  }

  private connectEventSource() {
    try {
      this.eventSource = new EventSource('/api/activities/stream');

      this.eventSource.onmessage = (event) => {
        try {
          const activity = activitySchema.parse(JSON.parse(event.data));
          this.subscribers.forEach(callback => callback(activity));
        } catch (_error) {
          errorLogger.log('Failed to parse activity event', {
            variant: 'error',
            context: { eventData: event.data },
            component: 'ActivityService',
          });
        }
      };

      this.eventSource.onerror = (error) => {
        errorLogger.log('Activity stream error', {
          variant: 'error',
          context: { error: _error instanceof Error ? _error.message : String(_error) },
          component: 'ActivityService',
        });
        this.disconnectEventSource();
        // Attempt to reconnect after a delay
        setTimeout(() => this.connectEventSource(), 5000);
      };
    } catch (_error) {
      errorLogger.log('Failed to connect to activity stream', {
        variant: 'error',
        context: { error: _error instanceof Error ? _error.message : String(_error) },
        component: 'ActivityService',
      });
    }
  }

  private disconnectEventSource() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Fetch activities with filtering
  async getActivities(options: {
    userId?: string;
    organizationId?: string;
    type?: Activity['type'];
    limit?: number;
    offset?: number;
  }): Promise<Activity[]> {
    try {
      const activities = await prisma.activity.findMany({
        where: {
          ...(options.userId && { userId: options.userId }),
          ...(options.type && { action: options.type }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: options.limit || 10,
        skip: options.offset || 0,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      });

      return activities.map(activity => {
        let metadata: Record<string, any> = {};
        if (activity.metadata && typeof activity.metadata === 'object' && !Array.isArray(activity.metadata)) {
          metadata = activity.metadata as Record<string, any>;
        }
        const user = activity.user && activity.user.id
          ? {
              id: activity.user.id,
              name: activity.user.name || 'Unknown User',
              image: activity.user.imageUrl || undefined,
            }
          : undefined;
        return {
          id: activity.id,
          type: activity.action as Activity['type'],
          action: activity.action,
          title: typeof metadata.title === 'string' ? metadata.title : '',
          description: typeof metadata.description === 'string' ? metadata.description : '',
          timestamp: activity.createdAt.toISOString(),
          user,
          ...metadata,
        } as Activity;
      });
    } catch (_error) {
      errorLogger.log('Failed to fetch activities', {
        variant: 'error',
        context: { error: _error instanceof Error ? _error.message : String(_error) },
        component: 'ActivityService',
      });
      throw _error;
    }
  }

  // Record a new activity
  async recordActivity(data: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> {
    try {
      const { user, ...rest } = data;
      const metadata: Record<string, any> = { ...rest };
      // Remove user from metadata if present
      delete metadata.user;
      // Remove duplicate title/description/type/action if present
      if ('title' in metadata) delete metadata.title;
      if ('description' in metadata) delete metadata.description;
      if ('type' in metadata) delete metadata.type;
      if ('action' in metadata) delete metadata.action;
      const createData: any = {
        action: data.type,
        entityType: 'USER',
        entityId: user && user.id ? user.id : 'system',
        metadata: {
          title: data.title,
          description: data.description,
          ...metadata,
        },
      };
      if (user && user.id) {
        createData.user = { connect: { id: user.id } };
      }
      const activity = await prisma.activity.create({
        data: createData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      });

      let createdMetadata: Record<string, any> = {};
      if (activity.metadata && typeof activity.metadata === 'object' && !Array.isArray(activity.metadata)) {
        createdMetadata = activity.metadata as Record<string, any>;
      }
      const createdUser = activity.user && activity.user.id
        ? {
            id: activity.user.id,
            name: activity.user.name || 'Unknown User',
            image: activity.user.imageUrl || undefined,
          }
        : undefined;
      return {
        id: activity.id,
        type: activity.action as Activity['type'],
        action: activity.action,
        title: typeof createdMetadata.title === 'string' ? createdMetadata.title : '',
        description: typeof createdMetadata.description === 'string' ? createdMetadata.description : '',
        timestamp: activity.createdAt.toISOString(),
        user: createdUser,
        ...createdMetadata,
      } as Activity;
    } catch (_error) {
      errorLogger.log('Failed to record activity', {
        variant: 'error',
        context: { error: _error instanceof Error ? _error.message : String(_error) },
        component: 'ActivityService',
      });
      throw _error;
    }
  }
}

export const activityService = ActivityService.getInstance(); 