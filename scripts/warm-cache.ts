#!/usr/bin/env ts-node

/**
 * Cache Warming Script
 * 
 * This script pre-loads frequently accessed data into the cache
 * to improve performance for the first users after deployment.
 * 
 * Usage:
 *   pnpm cache:warm
 *   ts-node scripts/warm-cache.ts
 */

import { cacheService, getCacheManager } from '../src/lib/cache/index';
import { enhancedPrisma } from '../src/lib/db/enhanced-prisma-client';
import { logger } from '../src/lib/utils/logger';

interface WarmingStrategy {
  name: string;
  description: string;
  priority: number;
  enabled: boolean;
  dataLoader: () => Promise<{ [key: string]: any }>;
}

async function main() {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│                    Cache Warming Process                   │
│                                                             │
│  🔥 Pre-loading frequently accessed data into cache        │
│  ⚡ Improving performance for first users                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
  `);

  try {
    // Initialize cache system
    const cacheManager = getCacheManager();
    const healthCheck = await cacheManager.healthCheck();
    
    if (!healthCheck.healthy) {
      console.error('❌ Cache system is not healthy, aborting cache warming');
      process.exit(1);
    }

    console.log('✅ Cache system is healthy\n');

    // Define warming strategies
    const warmingStrategies: WarmingStrategy[] = [
      {
        name: 'Organization Data',
        description: 'Load active organizations and their settings',
        priority: 1,
        enabled: true,
        dataLoader: loadOrganizations,
      },
      {
        name: 'User Profiles',
        description: 'Load active user profiles and preferences',
        priority: 2,
        enabled: true,
        dataLoader: loadUserProfiles,
      },
      {
        name: 'Campaign Templates',
        description: 'Load email and campaign templates',
        priority: 3,
        enabled: true,
        dataLoader: loadCampaignTemplates,
      },
      {
        name: 'Static Configuration',
        description: 'Load static configuration data',
        priority: 4,
        enabled: true,
        dataLoader: loadStaticConfiguration,
      },
      {
        name: 'Active Campaigns',
        description: 'Load currently active campaigns',
        priority: 5,
        enabled: true,
        dataLoader: loadActiveCampaigns,
      },
    ];

    // Sort strategies by priority
    const enabledStrategies = warmingStrategies
      .filter(s => s.enabled)
      .sort((a, b) => a.priority - b.priority);

    console.log(`📋 Warming strategies to execute: ${enabledStrategies.length}\n`);

    // Execute warming strategies
    let totalWarmed = 0;
    let successfulStrategies = 0;

    for (const strategy of enabledStrategies) {
      try {
        console.log(`🔥 [${strategy.priority}] ${strategy.name}`);
        console.log(`   Description: ${strategy.description}`);
        
        const startTime = Date.now();
        
        // Load data using strategy
        const data = await strategy.dataLoader();
        const itemCount = Object.keys(data).length;
        
        if (itemCount === 0) {
          console.log(`   ⚠️  No data to warm for ${strategy.name}`);
          continue;
        }

        // Warm cache based on strategy name
        const cacheStrategy = strategy.name.toLowerCase().replace(/\s+/g, '');
        await warmDataByStrategy(cacheStrategy, data);
        
        const duration = Date.now() - startTime;
        const durationSeconds = Math.round(duration / 1000);
        
        console.log(`   ✅ Warmed ${itemCount} items in ${durationSeconds}s\n`);
        
        totalWarmed += itemCount;
        successfulStrategies++;

      } catch (error) {
        console.error(`   ❌ Failed to warm ${strategy.name}:`, error);
        logger.error('Cache warming strategy failed', error as Error, { 
          strategy: strategy.name 
        });
      }
    }

    // Summary
    console.log(`\n📊 Cache Warming Summary:`);
    console.log(`   ✅ Successful strategies: ${successfulStrategies}/${enabledStrategies.length}`);
    console.log(`   🔥 Total items warmed: ${totalWarmed}`);
    console.log(`   📈 Success rate: ${Math.round((successfulStrategies / enabledStrategies.length) * 100)}%`);

    // Final health check
    const finalHealthCheck = await cacheManager.healthCheck();
    console.log(`\n🏥 Final cache health check:`);
    console.log(`   Redis: ${finalHealthCheck.redis ? '✅' : '❌'}`);
    console.log(`   Memory Cache: ${finalHealthCheck.memoryCache ? '✅' : '❌'}`);
    console.log(`   Hit Rate: ${finalHealthCheck.metrics.hitRate}%`);

    console.log('\n🎉 Cache warming completed successfully!');

  } catch (error) {
    console.error('❌ Cache warming failed:', error);
    logger.error('Cache warming process failed', error as Error);
    process.exit(1);
  }
}

// Data loading functions

async function loadOrganizations(): Promise<{ [key: string]: any }> {
  const organizations = await enhancedPrisma.getClient().organization.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
        take: 10, // Limit to active users
      },
    },
    take: 100, // Limit to most recent organizations
    orderBy: {
      createdAt: 'desc',
    },
  });

  const result: { [key: string]: any } = {};
  
  for (const org of organizations) {
    result[org.id] = org;
    
    // Also cache by clerk organization ID
    if (org.clerkOrganizationId) {
      result[org.clerkOrganizationId] = org;
    }
  }

  return result;
}

async function loadUserProfiles(): Promise<{ [key: string]: any }> {
  const users = await enhancedPrisma.getClient().user.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          clerkOrganizationId: true,
        },
      },
    },
    take: 500, // Limit to recent active users
    orderBy: {
      lastActiveAt: 'desc',
    },
  });

  const result: { [key: string]: any } = {};
  
  for (const user of users) {
    result[user.id] = user;
    
    // Also cache by clerk user ID
    if (user.clerkUserId) {
      result[user.clerkUserId] = user;
    }
  }

  return result;
}

async function loadCampaignTemplates(): Promise<{ [key: string]: any }> {
  const templates = await enhancedPrisma.getClient().template.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    take: 200, // Limit to most used templates
    orderBy: {
      usageCount: 'desc',
    },
  });

  const result: { [key: string]: any } = {};
  
  for (const template of templates) {
    result[template.id] = template;
  }

  return result;
}

async function loadStaticConfiguration(): Promise<{ [key: string]: any }> {
  // Load static configuration that rarely changes
  const config = {
    'email-providers': {
      sendgrid: {
        enabled: !!process.env.SENDGRID_API_KEY,
        rateLimit: 1000,
        batchSize: 1000,
      },
      ses: {
        enabled: !!process.env.AWS_ACCESS_KEY_ID,
        rateLimit: 200,
        batchSize: 50,
      },
      resend: {
        enabled: !!process.env.RESEND_API_KEY,
        rateLimit: 100,
        batchSize: 50,
      },
    },
    'system-settings': {
      maxCampaignSize: 1000000,
      maxAttachmentSize: 25 * 1024 * 1024, // 25MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      defaultTtl: 3600,
    },
    'ui-settings': {
      theme: 'light',
      locale: 'en-US',
      timezone: 'UTC',
      dateFormat: 'yyyy-MM-dd',
      timeFormat: '24h',
    },
  };

  return config;
}

async function loadActiveCampaigns(): Promise<{ [key: string]: any }> {
  const campaigns = await enhancedPrisma.getClient().campaign.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'PAUSED', 'SCHEDULED'],
      },
      deletedAt: null,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      content: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
        },
        take: 5,
      },
    },
    take: 100, // Limit to most recent active campaigns
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const result: { [key: string]: any } = {};
  
  for (const campaign of campaigns) {
    result[campaign.id] = campaign;
  }

  return result;
}

// Cache warming helper function
async function warmDataByStrategy(strategy: string, data: { [key: string]: any }): Promise<void> {
  const keys = Object.keys(data);
  const batchSize = 50;
  
  // Process in batches to avoid overwhelming the cache
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const batchData: { [key: string]: any } = {};
    
    for (const key of batch) {
      batchData[key] = data[key];
    }
    
    // Use appropriate cache service method based on strategy
    switch (strategy) {
      case 'organizationdata':
        await cacheService.batchSetCampaigns(batchData); // Organizations use campaign-like caching
        break;
      case 'userprofiles':
        await cacheService.batchSetCampaigns(batchData); // Users use campaign-like caching
        break;
      case 'campaigntemplates':
        await cacheService.batchSetCampaigns(batchData);
        break;
      case 'staticconfiguration':
        for (const [key, value] of Object.entries(batchData)) {
          await cacheService.setStaticData(key, value);
        }
        break;
      case 'activecampaigns':
        await cacheService.batchSetCampaigns(batchData);
        break;
      default:
        // Generic caching
        for (const [key, value] of Object.entries(batchData)) {
          await cacheService.setStaticData(key, value);
        }
    }
  }
}

// Run the warming process
main().catch(console.error);