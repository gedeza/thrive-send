import { activityService } from '@/lib/services/activity-service';
import { prisma } from '@/lib/prisma';
import { Activity } from '@/types/activity';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    activity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('ActivityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivities', () => {
    it('should return activities in correct format', async () => {
      const mockActivities = [
        {
          id: '1',
          action: 'campaign',
          entityType: 'USER',
          entityId: 'user123',
          metadata: { title: 'Test Activity', description: 'Test Description' },
          createdAt: new Date('2024-01-01T00:00:00Z'),
          userId: 'user123',
          user: {
            id: 'user123',
            name: 'Test User',
            imageUrl: 'https://example.com/image.png',
          },
        },
      ];

      (prisma.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);

      const result = await activityService.getActivities({ userId: 'user123' });

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('id', '1');
      expect(result[0]).toHaveProperty('type', 'campaign');
      expect(result[0]).toHaveProperty('action', 'campaign');
      expect(result[0]).toHaveProperty('title', 'Test Activity');
      expect(result[0]).toHaveProperty('description', 'Test Description');
      expect(result[0]).toHaveProperty('timestamp');
      expect(result[0].user).toEqual({
        id: 'user123',
        name: 'Test User',
        image: 'https://example.com/image.png',
      });
    });

    it('should handle errors gracefully', async () => {
      (prisma.activity.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(activityService.getActivities({ userId: 'user123' })).rejects.toThrow('Database error');
    });
  });

  describe('recordActivity', () => {
    it('should record an activity successfully', async () => {
      const mockActivity: Omit<Activity, 'id' | 'timestamp'> = {
        type: 'campaign',
        title: 'New Campaign',
        description: 'Campaign created',
        user: {
          id: 'user123',
          name: 'Test User',
          image: 'https://example.com/image.png',
        },
      };

      const mockCreatedActivity = {
        id: '1',
        action: 'campaign',
        entityType: 'USER',
        entityId: 'user123',
        metadata: { title: 'New Campaign', description: 'Campaign created' },
        createdAt: new Date('2024-01-01T00:00:00Z'),
        userId: 'user123',
        user: {
          id: 'user123',
          name: 'Test User',
          imageUrl: 'https://example.com/image.png',
        },
      };

      (prisma.activity.create as jest.Mock).mockResolvedValue(mockCreatedActivity);

      const result = await activityService.recordActivity(mockActivity);

      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('type', 'campaign');
      expect(result).toHaveProperty('action', 'campaign');
      expect(result).toHaveProperty('title', 'New Campaign');
      expect(result).toHaveProperty('description', 'Campaign created');
      expect(result).toHaveProperty('timestamp');
      expect(result.user).toEqual({
        id: 'user123',
        name: 'Test User',
        image: 'https://example.com/image.png',
      });
    });

    it('should handle errors gracefully', async () => {
      const mockActivity: Omit<Activity, 'id' | 'timestamp'> = {
        type: 'campaign',
        title: 'New Campaign',
        description: 'Campaign created',
        user: {
          id: 'user123',
          name: 'Test User',
          image: 'https://example.com/image.png',
        },
      };

      (prisma.activity.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(activityService.recordActivity(mockActivity)).rejects.toThrow('Database error');
    });
  });
}); 