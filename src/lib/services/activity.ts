import { prisma } from '@/lib/prisma';

export type ActivityType = 
  | 'PROFILE_UPDATE'
  | 'CONTENT_CREATE'
  | 'CONTENT_UPDATE'
  | 'SOCIAL_POST'
  | 'SETTINGS_UPDATE';

export interface ActivityData {
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
}

export const activityService = {
  async recordActivity(userId: string, data: ActivityData) {
    return prisma.activity.create({
      data: {
        userId,
        action: data.type,
        entityType: 'USER',
        entityId: userId,
        metadata: data.metadata || {},
      },
    });
  },

  async getUserActivities(userId: string, limit = 10) {
    return prisma.activity.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  },

  async getRecentActivities(limit = 10) {
    return prisma.activity.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  },
}; 