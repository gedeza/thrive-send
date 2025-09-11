import { prisma, queryOptimizations, connectionManager } from './optimizations';
import { User, Campaign, Analytics, Content, CampaignStatus } from '@prisma/client';

// Example 1: Basic query optimization
async function getUsersWithOptimization() {
  return prisma.optimizeQuery(async () => {
    return prisma.user.findMany({
      include: {
        organizationMemberships: {
          include: {
            organization: true
          }
        }
      }
    });
  });
}

// Example 2: Batch operations
async function createMultipleUsers(users: Partial<User>[]) {
  return queryOptimizations.batchOperation(
    users.map(user => () => 
      prisma.user.create({
        data: user as any // Type assertion needed due to partial data
      })
    )
  );
}

// Example 3: Paginated queries
async function getPaginatedCampaigns(page: number = 1, pageSize: number = 10) {
  return queryOptimizations.paginatedQuery(
    (skip, take) => prisma.campaign.findMany({
      skip,
      take,
      include: {
        content: true,
        analytics: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    page,
    pageSize
  );
}

// Example 4: Using the cache helper
async function getCachedAnalytics(campaignId: string) {
  return queryOptimizations.withCache(
    `analytics-${campaignId}`,
    () => prisma.analytics.findFirst({
      where: { campaignId },
      include: {
        client: true
      }
    }),
    600 // 10 minutes TTL
  );
}

// Example 5: Connection management
async function ensureDatabaseConnection() {
  const isConnected = await connectionManager.checkConnection();
  if (!isConnected) {
    console.log('Attempting to reconnect to database...');
    await connectionManager.reconnect();
  }
  return isConnected;
}

// Example 6: Complex query with optimization
async function getCampaignPerformance(campaignId: string) {
  return prisma.optimizeQuery(async () => {
    const [campaign, analytics, content] = await Promise.all([
      prisma.campaign.findUnique({
        where: { id: campaignId }
      }),
      prisma.analytics.findFirst({
        where: { campaignId }
      }),
      prisma.content.findMany({
        where: { campaignId }
      })
    ]);

    return {
      campaign,
      analytics,
      content,
      performance: {
        engagement: analytics?.engagements || 0,
        reach: analytics?.views || 0
      }
    };
  });
}

// Example 7: Transaction with optimization
async function updateCampaignWithContent(campaignId: string, contentData: Partial<Content>) {
  return prisma.optimizeQuery(async () => {
    return prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'active' as CampaignStatus,
          updatedAt: new Date()
        }
      });

      const newContent = await tx.content.create({
        data: {
          ...contentData,
          campaignId
        } as any // Type assertion needed due to partial data
      });

      return { campaign, content: newContent };
    });
  });
}

// Example 8: Error handling with optimization
async function safeQuery<T>(queryFn: () => Promise<T>): Promise<{ data?: T; error?: string }> {
  try {
    const data = await prisma.optimizeQuery(queryFn);
    return { data };
  } catch (_error) {
    console.error("", _error);
    return { error: 'Failed to execute query' };
  }
}

// Usage examples:
async function demonstrateUsage() {
  // Basic query
  const users = await getUsersWithOptimization();
  
  // Paginated campaigns
  const { data: campaigns, total } = await getPaginatedCampaigns(1, 10);
  
  // Batch create users
  const newUsers = await createMultipleUsers([
    { name: 'User 1', email: 'user1@example.com' },
    { name: 'User 2', email: 'user2@example.com' }
  ]);
  
  // Get cached analytics
  const analytics = await getCachedAnalytics('campaign-123');
  
  // Ensure connection
  await ensureDatabaseConnection();
  
  // Complex query
  const performance = await getCampaignPerformance('campaign-123');
  
  // Transaction
  const update = await updateCampaignWithContent('campaign-123', {
    title: 'New Content',
    content: 'Content body'
  });
  
  // Safe query
  const result = await safeQuery(() => 
    prisma.user.findUnique({ where: { id: 'user-123' } })
  );
} 